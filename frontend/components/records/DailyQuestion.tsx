'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, RotateCcw, Lightbulb, BookOpen } from 'lucide-react';
import { getDailyQuestion, submitAnswer, BookRecommendation } from '@/lib/questionApi';

interface Question {
  id: string;
  type: 'philosophy' | 'psychology' | 'story' | 'reflection';
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  category: string;
  books: BookRecommendation[];
}

interface DailyQuestionProps {
  date: string;
  onCompleted: () => void;
}

export function DailyQuestion({ date, onCompleted }: DailyQuestionProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const data = await getDailyQuestion();
      setQuestion(data);
      setCompleted(data.alreadyAnswered);
      if (data.alreadyAnswered) {
        setSelectedOption(data.userAnswer || null);
        setShowAnswer(true);
      }
    } catch (err) {
      console.error('Failed to load question:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  const handleAnswer = async (answer: string) => {
    if (completed) return;

    setSelectedOption(answer);
    setShowAnswer(true);

    try {
      await submitAnswer(question!.id, answer);
      setCompleted(true);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  };

  const handleRetry = () => {
    setShowAnswer(false);
    setSelectedOption(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          加载题目中...
        </CardContent>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          今日暂无题目
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            今日一题
          </CardTitle>
          {completed && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              已完成
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {question.type === 'philosophy' ? '哲学思辨' :
             question.type === 'psychology' ? '心理洞察' :
             question.type === 'story' ? '故事启发' : '反思时刻'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {question.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">{question.question}</p>

          {!showAnswer && !completed && (
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedOption === option ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => handleAnswer(option)}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
            </div>
          )}

          {showAnswer && (
            <div className="space-y-4 pt-4 border-t">
              {selectedOption && (
                <div className={`rounded-lg p-3 ${selectedOption === question.answer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className="text-sm">
                    <span className="font-semibold">你的答案：</span>{selectedOption}
                    {selectedOption === question.answer ? ' ✓ 正确' : ' ✗ 错误'}
                  </p>
                  {selectedOption !== question.answer && (
                    <p className="text-sm mt-1">
                      <span className="font-semibold">正确答案：</span>{question.answer}
                    </p>
                  )}
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  深度解析
                </h4>
                <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
              </div>

              {question.books && question.books.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                    推荐书籍
                  </h4>
                  <div className="space-y-2">
                    {question.books.map((book, index) => (
                      <div key={index} className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">📖</span>
                          <div>
                            <p className="font-medium text-sm">{book.title}</p>
                            <p className="text-xs text-muted-foreground">作者：{book.author}</p>
                            <p className="text-xs text-muted-foreground mt-1">{book.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!completed && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    重新选择
                  </Button>
                  <Button
                    onClick={() => {
                      setCompleted(true);
                      onCompleted();
                    }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    完成
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

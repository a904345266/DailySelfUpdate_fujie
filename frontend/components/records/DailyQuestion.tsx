'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, RotateCcw, Lightbulb, MessageSquare } from 'lucide-react';
import { getDailyQuestion, submitAnswer } from '@/lib/questionApi';
import { extractErrorMessage } from '@/lib/api';

interface Question {
  id: string;
  type: 'philosophy' | 'psychology' | 'story' | 'reflection';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  category: string;
}

interface DailyQuestionProps {
  date: string;
  onCompleted: () => void;
}

export function DailyQuestion({ date, onCompleted }: DailyQuestionProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
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
        setTextAnswer(data.userAnswer || '');
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
    if (completed || !answer.trim()) return;
    
    setSelectedOption(answer);
    setShowAnswer(true);
    
    try {
      await submitAnswer(question!.id, answer);
      setCompleted(true);
      setTimeout(() => {
        onCompleted();
      }, 1500);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  };

  const handleRetry = () => {
    setShowAnswer(false);
    setSelectedOption(null);
    setTextAnswer('');
  };

  const hasOptions = question?.options && question.options.length > 0;

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
          
          {!showAnswer && !completed && hasOptions && (
            <div className="space-y-2">
              {question.options!.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedOption === option ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleAnswer(option)}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </Button>
              ))}
            </div>
          )}
          
          {!showAnswer && !completed && !hasOptions && (
            <div className="space-y-3">
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="写下你的思考..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                className="w-full"
                disabled={!textAnswer.trim()}
                onClick={() => handleAnswer(textAnswer)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                提交思考
              </Button>
            </div>
          )}
          
          {showAnswer && (
            <div className="space-y-4 pt-4 border-t">
              {question.answer && !hasOptions && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    参考回答
                  </h4>
                  <p className="text-muted-foreground text-sm">{question.answer}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  深度解析
                </h4>
                <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
              </div>
              
              {!completed && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetry}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    重新思考
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
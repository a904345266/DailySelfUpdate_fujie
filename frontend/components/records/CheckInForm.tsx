'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Gift, Trophy, Sparkles } from 'lucide-react';
import { DailyQuestion } from './DailyQuestion';
import { checkIn, getCheckInData } from '@/lib/checkInApi';
import { extractErrorMessage } from '@/lib/api';

interface CheckInData {
  totalCheckIns: number;
  consecutiveDays: number;
  abilityPoints: number;
  lastCheckInDate: string | null;
  weeklyGoal: number;
  weeklyProgress: number;
  unlockedGifts: number;
}

interface CheckInFormProps {
  date: string;
  onCheckedIn: () => void;
}

export function CheckInForm({ date, onCheckedIn }: CheckInFormProps) {
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const loadCheckInData = async () => {
    try {
      const data = await getCheckInData();
      setCheckInData(data);
    } catch (err) {
      console.error('Failed to load check-in data:', err);
      // 初始化默认数据
      setCheckInData({
        totalCheckIns: 0,
        consecutiveDays: 0,
        abilityPoints: 0,
        lastCheckInDate: null,
        weeklyGoal: 7,
        weeklyProgress: 0,
        unlockedGifts: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCheckInData();
  }, []);

  const handleCheckIn = async () => {
    if (checkInData?.lastCheckInDate === date) {
      toast.error('今天已经签到过了！');
      // 即使已签到，也允许用户查看当天的题目
      setShowQuestionModal(true);
      return;
    }

    setIsCheckingIn(true);
    try {
      const result = await checkIn();
      setCheckInData(result);
      toast.success('✅ 签到成功！能力值+5');
      
      // 签到成功后显示题目弹窗
      setShowQuestionModal(true);
      
      // 不立即调用onCheckedIn，等待用户完成题目后再调用
    } catch (err) {
      toast.error(extractErrorMessage(err, '签到失败'));
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleQuestionComplete = () => {
    setShowQuestionModal(false);
    onCheckedIn(); // 通知父组件数据已更新
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">加载中...</p>
        </CardContent>
      </Card>
    );
  }

  const todayIsCheckedIn = checkInData?.lastCheckInDate === date;
  const canCheckIn = !todayIsCheckedIn;

  return (
    <div className="space-y-6">
      {/* 签到卡片 */}
      <Card className="relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-20">
          <Trophy className="h-16 w-16" />
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              每日打卡签到
            </CardTitle>
            {todayIsCheckedIn && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                已签到
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">本周进度</span>
                  <span className="text-sm text-muted-foreground">
                    {checkInData?.weeklyProgress}/{checkInData?.weeklyGoal}
                  </span>
                </div>
                <Progress value={(checkInData?.weeklyProgress || 0) * (100 / (checkInData?.weeklyGoal || 1))} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">
                    {checkInData?.consecutiveDays}
                  </div>
                  <div className="text-xs text-muted-foreground">连续天数</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-blue-500">
                    {checkInData?.abilityPoints}
                  </div>
                  <div className="text-xs text-muted-foreground">能力值</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-purple-500">
                    {checkInData?.unlockedGifts}
                  </div>
                  <div className="text-xs text-muted-foreground">礼物</div>
                </div>
              </div>

              <Button 
                onClick={handleCheckIn} 
                disabled={!canCheckIn || isCheckingIn}
                className={`w-full ${canCheckIn ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' : ''}`}
              >
                {isCheckingIn ? (
                  '签到中...'
                ) : todayIsCheckedIn ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    今日已完成
                  </>
                ) : (
                  '立即签到 +5 能力值'
                )}
              </Button>
            </div>
            
            <div className="sm:w-32 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border">
              <Gift className="h-10 w-10 text-yellow-500 mb-2" />
              <div className="text-center">
                <div className="text-sm font-medium">每周奖励</div>
                <div className="text-xs text-muted-foreground">
                  {checkInData?.weeklyProgress === 7 ? '已解锁' : `${7 - (checkInData?.weeklyProgress || 0)} 天后解锁`}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 成就展示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            我的成就
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-bold text-primary">{checkInData?.totalCheckIns}</div>
              <div className="text-xs text-muted-foreground">累计签到</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-bold text-blue-500">{checkInData?.consecutiveDays}</div>
              <div className="text-xs text-muted-foreground">连续签到</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-bold text-green-500">{Math.floor(checkInData?.abilityPoints / 5)}</div>
              <div className="text-xs text-muted-foreground">获得徽章</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-lg font-bold text-purple-500">{checkInData?.unlockedGifts}</div>
              <div className="text-xs text-muted-foreground">解锁礼物</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 每日一题弹窗 */}
      <Dialog open={showQuestionModal} onOpenChange={setShowQuestionModal}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              今日一题
            </DialogTitle>
          </DialogHeader>
          <DailyQuestion date={date} onCompleted={handleQuestionComplete} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
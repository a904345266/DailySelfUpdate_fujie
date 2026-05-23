'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StarRating } from '@/components/ui/star-rating';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { upsertReflection, type DailyReflection } from '@/lib/recordsApi';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  date: string;
  initial: DailyReflection | null;
  onSaved: () => void;
}

export function ReflectionForm({ date, initial, onSaved }: Props) {
  const [morningGoal, setMorningGoal] = useState(initial?.morningGoal ?? '');
  const [morningMood, setMorningMood] = useState(initial?.morningMood ?? '');
  const [noonCheck, setNoonCheck] = useState(initial?.noonCheck ?? '');
  const [noonProgress, setNoonProgress] = useState<number | ''>(initial?.noonProgress ?? '');
  const [eveningReflection, setEveningReflection] = useState(initial?.eveningReflection ?? '');
  const [overallRating, setOverallRating] = useState(initial?.overallRating ?? 0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMorningGoal(initial?.morningGoal ?? '');
    setMorningMood(initial?.morningMood ?? '');
    setNoonCheck(initial?.noonCheck ?? '');
    setNoonProgress(initial?.noonProgress ?? '');
    setEveningReflection(initial?.eveningReflection ?? '');
    setOverallRating(initial?.overallRating ?? 0);
  }, [initial]);

  const submit = async () => {
    setSubmitting(true);
    try {
      await upsertReflection({
        date,
        morningGoal: morningGoal || undefined,
        morningMood: morningMood || undefined,
        noonCheck: noonCheck || undefined,
        noonProgress: typeof noonProgress === 'number' ? noonProgress : undefined,
        eveningReflection: eveningReflection || undefined,
        overallRating: overallRating || undefined,
      });
      toast.success('每日三省已保存');
      onSaved();
    } catch (err) {
      toast.error(extractErrorMessage(err, '保存失败'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-lg border bg-card p-4">
        <h3 className="text-base font-semibold">🌅 早晨</h3>
        <div className="space-y-2">
          <Label>今日目标和期待</Label>
          <VoiceInput
            value={morningGoal}
            onChange={setMorningGoal}
            placeholder="今天最想完成什么？最期待什么？"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="morning-mood">早晨心情</Label>
          <Input
            id="morning-mood"
            value={morningMood}
            onChange={(e) => setMorningMood(e.target.value)}
            placeholder="例如：清晰 / 焦虑 / 期待"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <h3 className="text-base font-semibold">☀️ 中午</h3>
        <div className="space-y-2">
          <Label>进度检查和调整</Label>
          <VoiceInput
            value={noonCheck}
            onChange={setNoonCheck}
            placeholder="上午进行得怎么样？需要调整什么？"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="noon-progress">完成度 (0-100)</Label>
          <Input
            id="noon-progress"
            type="number"
            min={0}
            max={100}
            value={noonProgress}
            onChange={(e) => {
              const v = e.target.value;
              setNoonProgress(v === '' ? '' : Math.max(0, Math.min(100, Number(v))));
            }}
            placeholder="0-100"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <h3 className="text-base font-semibold">🌙 晚上</h3>
        <div className="space-y-2">
          <Label>总结反思和感恩</Label>
          <VoiceInput
            value={eveningReflection}
            onChange={setEveningReflection}
            placeholder="今天最大的收获、挑战、需要感谢的事..."
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label>今日整体评分</Label>
          <StarRating value={overallRating} onChange={setOverallRating} />
        </div>
      </section>

      <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
        {submitting ? '保存中...' : '保存今日三省'}
      </Button>
    </div>
  );
}

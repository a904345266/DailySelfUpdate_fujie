'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select-native';
import { StarRating } from '@/components/ui/star-rating';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { createWork, type WorkCategory, type WorkEmotion } from '@/lib/recordsApi';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  date: string;
  onCreated: () => void;
}

const CATEGORY_LABELS: Record<WorkCategory, string> = {
  achievement: '成就',
  challenge: '挑战',
  learning: '学习',
  routine: '日常',
};
const EMOTION_LABELS: Record<WorkEmotion, string> = {
  satisfied: '满意',
  anxious: '焦虑',
  neutral: '平静',
  excited: '兴奋',
};

export function WorkForm({ date, onCreated }: Props) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<WorkCategory>('achievement');
  const [emotion, setEmotion] = useState<WorkEmotion>('satisfied');
  const [importance, setImportance] = useState(3);
  const [timeSpent, setTimeSpent] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setContent('');
    setCategory('achievement');
    setEmotion('satisfied');
    setImportance(3);
    setTimeSpent('');
    setFollowUp('');
  };

  const submit = async () => {
    if (!content.trim()) {
      toast.error('请先记录内容');
      return;
    }
    setSubmitting(true);
    try {
      await createWork({
        date,
        content: content.trim(),
        category,
        emotion,
        importance,
        timeSpent: timeSpent.trim() || undefined,
        followUpAction: followUp.trim() || undefined,
      });
      toast.success('已记录');
      reset();
      onCreated();
    } catch (err) {
      toast.error(extractErrorMessage(err, '保存失败'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <Label>今天工作中发生了什么？</Label>
        <VoiceInput
          value={content}
          onChange={setContent}
          placeholder="点击右侧麦克风说出今天的工作记录..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>分类</Label>
          <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as WorkCategory)}>
            {(Object.keys(CATEGORY_LABELS) as WorkCategory[]).map((k) => (
              <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label>情绪</Label>
          <NativeSelect value={emotion} onChange={(e) => setEmotion(e.target.value as WorkEmotion)}>
            {(Object.keys(EMOTION_LABELS) as WorkEmotion[]).map((k) => (
              <option key={k} value={k}>{EMOTION_LABELS[k]}</option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>重要性</Label>
          <StarRating value={importance} onChange={setImportance} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="work-time">时间花费（可选）</Label>
          <Input
            id="work-time"
            placeholder="如 2 小时"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="work-followup">后续行动（可选）</Label>
        <Input
          id="work-followup"
          placeholder="如 明天与 Alex 同步进展"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
        />
      </div>

      <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
        {submitting ? '保存中...' : '保存工作记录'}
      </Button>
    </div>
  );
}

export { CATEGORY_LABELS as WORK_CATEGORY_LABELS, EMOTION_LABELS as WORK_EMOTION_LABELS };

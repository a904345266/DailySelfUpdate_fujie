'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select-native';
import { StarRating } from '@/components/ui/star-rating';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { createGratitude, type GratitudeCategory } from '@/lib/recordsApi';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  date: string;
  onCreated: () => void;
}

export const GRATITUDE_CATEGORY_LABELS: Record<GratitudeCategory, string> = {
  nature: '自然',
  person: '人物',
  achievement: '成就',
  moment: '美好时刻',
  health: '健康',
};

export function GratitudeForm({ date, onCreated }: Props) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<GratitudeCategory>('moment');
  const [emotion, setEmotion] = useState('peaceful');
  const [impactLevel, setImpactLevel] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!content.trim()) {
      toast.error('请先记录内容');
      return;
    }
    setSubmitting(true);
    try {
      await createGratitude({
        date,
        content: content.trim(),
        category,
        emotion,
        impactLevel,
      });
      toast.success('已记录');
      setContent('');
      setImpactLevel(3);
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
        <Label>今天感恩什么？</Label>
        <VoiceInput
          value={content}
          onChange={setContent}
          placeholder="说出一件让你心怀感激的事..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>分类</Label>
          <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as GratitudeCategory)}>
            {(Object.keys(GRATITUDE_CATEGORY_LABELS) as GratitudeCategory[]).map((k) => (
              <option key={k} value={k}>{GRATITUDE_CATEGORY_LABELS[k]}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="grat-emotion">情绪</Label>
          <Input
            id="grat-emotion"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>影响力</Label>
        <StarRating value={impactLevel} onChange={setImpactLevel} />
      </div>

      <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
        {submitting ? '保存中...' : '保存感恩记录'}
      </Button>
    </div>
  );
}

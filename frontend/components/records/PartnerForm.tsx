'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { NativeSelect } from '@/components/ui/select-native';
import { StarRating } from '@/components/ui/star-rating';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { createPartner, type PartnerInteraction } from '@/lib/recordsApi';
import { PARTNER_EMOTIONS } from '@/lib/emotions';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  date: string;
  onCreated: () => void;
}

export const PARTNER_INTERACTION_LABELS: Record<PartnerInteraction, string> = {
  quality_time: '共处时光',
  conversation: '深入对话',
  argument: '争论',
  support: '互相支持',
};

export function PartnerForm({ date, onCreated }: Props) {
  const [partnerName, setPartnerName] = useState('');
  const [interactionType, setInteractionType] = useState<PartnerInteraction>('quality_time');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('loving');
  const [importance, setImportance] = useState(4);
  const [resolved, setResolved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isArgument = interactionType === 'argument';

  const submit = async () => {
    if (!partnerName.trim() || !content.trim()) {
      toast.error('请填写伴侣名字和互动内容');
      return;
    }
    setSubmitting(true);
    try {
      await createPartner({
        date,
        partnerName: partnerName.trim(),
        interactionType,
        content: content.trim(),
        emotion,
        importance,
        resolved: isArgument ? resolved : undefined,
      });
      toast.success('已记录');
      setContent('');
      setResolved(false);
      onCreated();
    } catch (err) {
      toast.error(extractErrorMessage(err, '保存失败'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="partner-name">伴侣</Label>
          <Input
            id="partner-name"
            placeholder="例如：TA"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>互动类型</Label>
          <NativeSelect value={interactionType} onChange={(e) => setInteractionType(e.target.value as PartnerInteraction)}>
            {(Object.keys(PARTNER_INTERACTION_LABELS) as PartnerInteraction[]).map((k) => (
              <option key={k} value={k}>{PARTNER_INTERACTION_LABELS[k]}</option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-2">
        <Label>互动内容</Label>
        <VoiceInput
          value={content}
          onChange={setContent}
          placeholder="今天和伴侣之间发生了什么..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="partner-emotion">情绪</Label>
          <NativeSelect
            id="partner-emotion"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
          >
            {PARTNER_EMOTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label>重要性</Label>
          <StarRating value={importance} onChange={setImportance} />
        </div>
      </div>

      {isArgument && (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={resolved} onChange={(e) => setResolved(e.target.checked)} />
          <span>这次争论已经解决</span>
        </label>
      )}

      <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
        {submitting ? '保存中...' : '保存伴侣记录'}
      </Button>
    </div>
  );
}

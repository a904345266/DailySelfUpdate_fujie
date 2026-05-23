'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select-native';
import { StarRating } from '@/components/ui/star-rating';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { createFriend, type FriendInteraction } from '@/lib/recordsApi';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  date: string;
  onCreated: () => void;
}

export const FRIEND_INTERACTION_LABELS: Record<FriendInteraction, string> = {
  chat: '聊天',
  meet: '见面',
  call: '通话',
  message: '消息',
};

export function FriendForm({ date, onCreated }: Props) {
  const [friendName, setFriendName] = useState('');
  const [interactionType, setInteractionType] = useState<FriendInteraction>('chat');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('happy');
  const [importance, setImportance] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!friendName.trim() || !content.trim()) {
      toast.error('请填写朋友名字和互动内容');
      return;
    }
    setSubmitting(true);
    try {
      await createFriend({
        date,
        friendName: friendName.trim(),
        interactionType,
        content: content.trim(),
        emotion,
        importance,
      });
      toast.success('已记录');
      setFriendName('');
      setContent('');
      setEmotion('happy');
      setImportance(3);
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
          <Label htmlFor="friend-name">朋友</Label>
          <Input
            id="friend-name"
            placeholder="例如：小明"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>互动方式</Label>
          <NativeSelect value={interactionType} onChange={(e) => setInteractionType(e.target.value as FriendInteraction)}>
            {(Object.keys(FRIEND_INTERACTION_LABELS) as FriendInteraction[]).map((k) => (
              <option key={k} value={k}>{FRIEND_INTERACTION_LABELS[k]}</option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="space-y-2">
        <Label>互动内容</Label>
        <VoiceInput
          value={content}
          onChange={setContent}
          placeholder="说说今天和这位朋友发生了什么..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="friend-emotion">情绪</Label>
          <Input
            id="friend-emotion"
            placeholder="例如：开心 / 感动 / 担心"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>重要性</Label>
          <StarRating value={importance} onChange={setImportance} />
        </div>
      </div>

      <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
        {submitting ? '保存中...' : '保存朋友记录'}
      </Button>
    </div>
  );
}

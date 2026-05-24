// Shared emotion options for relationship records, so the friend/partner forms
// offer a consistent set of choices instead of free text. Values are stored
// as-is in the DB `emotion` field (string), labels are shown in the UI.

export interface EmotionOption {
  value: string;
  label: string;
}

// Friends: more social / companionship-oriented feelings.
export const FRIEND_EMOTIONS: EmotionOption[] = [
  { value: 'happy', label: '开心' },
  { value: 'moved', label: '感动' },
  { value: 'grateful', label: '感激' },
  { value: 'relaxed', label: '放松' },
  { value: 'inspired', label: '受启发' },
  { value: 'nostalgic', label: '怀念' },
  { value: 'worried', label: '担心' },
  { value: 'awkward', label: '尴尬' },
  { value: 'disappointed', label: '失望' },
];

// Partner: more intimate / relational feelings.
export const PARTNER_EMOTIONS: EmotionOption[] = [
  { value: 'loving', label: '充满爱意' },
  { value: 'warm', label: '温暖' },
  { value: 'secure', label: '安心' },
  { value: 'grateful', label: '感激' },
  { value: 'passionate', label: '心动' },
  { value: 'calm', label: '平静' },
  { value: 'frustrated', label: '沮丧' },
  { value: 'hurt', label: '受伤' },
  { value: 'distant', label: '疏离' },
];

/** Lookup a label by value across both sets (for display in history/list). */
const ALL = [...FRIEND_EMOTIONS, ...PARTNER_EMOTIONS];
export function emotionLabel(value: string): string {
  return ALL.find((e) => e.value === value)?.label ?? value;
}

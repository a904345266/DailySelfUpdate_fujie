import { api } from './api';

export interface RefineResult {
  text: string; // 整理后的文本
  mode: 'basic' | 'polish'; // basic=精简去冗余, polish=提炼润色(VIP)
  changed: boolean; // 是否与原文不同
}

/** AI 整理文本：免费=精简去冗余，VIP=提炼润色（后端按 tier 决定）。 */
export async function refineText(text: string): Promise<RefineResult> {
  const res = await api.post('/text/refine', { text });
  return { text: res.data.text, mode: res.data.mode, changed: res.data.changed };
}

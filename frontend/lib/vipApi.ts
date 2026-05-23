import { api } from './api';

export interface VipStatus {
  tier: 'free' | 'vip';
  vipExpiresAt: string | null;
  isPermanent: boolean;
}

export interface RedeemResult extends VipStatus {
  grantedHours: number;
}

export async function getVipStatus(): Promise<VipStatus> {
  const res = await api.get('/vip/status');
  const { success: _s, ...rest } = res.data;
  void _s;
  return rest as VipStatus;
}

export async function redeemVipCode(code: string): Promise<RedeemResult> {
  const res = await api.post('/vip/redeem', { code });
  const { success: _s, ...rest } = res.data;
  void _s;
  return rest as RedeemResult;
}

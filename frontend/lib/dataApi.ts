import { api } from './api';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

/**
 * Trigger a download by fetching with the auth header and saving the blob.
 * We can't use a plain <a href> because the endpoint requires an Authorization
 * header that browsers won't attach to navigations.
 */
export async function downloadExport(opts: {
  format: 'json' | 'csv';
  startDate?: string;
  endDate?: string;
}): Promise<void> {
  const token = useAuthStore.getState().accessToken;
  const params = new URLSearchParams({ format: opts.format });
  if (opts.startDate) params.set('startDate', opts.startDate);
  if (opts.endDate) params.set('endDate', opts.endDate);

  const res = await fetch(`${BASE_URL}/data/export?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Export failed (${res.status})`);
  }

  // Pull filename out of Content-Disposition if present
  const cd = res.headers.get('content-disposition') ?? '';
  const match = cd.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `dailyselfupdate-export.${opts.format}`;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  inserted: { work: number; friend: number; partner: number; gratitude: number; reflection: number };
  skipped: number;
  strategy: 'merge' | 'replace';
}

export async function importData(
  payload: unknown,
  strategy: 'merge' | 'replace'
): Promise<ImportResult> {
  const res = await api.post('/data/import', { strategy, payload });
  return res.data.result;
}

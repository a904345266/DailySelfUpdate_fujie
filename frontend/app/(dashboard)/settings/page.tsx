'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Download, Upload, AlertTriangle, Crown, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadExport, importData, type ImportResult } from '@/lib/dataApi';
import { getVipStatus, redeemVipCode, type VipStatus } from '@/lib/vipApi';
import { extractErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

function formatExpiry(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = Date.now();
  const hoursLeft = Math.max(0, Math.round((d.getTime() - now) / 3_600_000));
  const dateStr = d.toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' });
  return `${dateStr}（剩约 ${hoursLeft} 小时）`;
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // VIP
  const [vip, setVip] = useState<VipStatus | null>(null);
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // Export
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [exporting, setExporting] = useState(false);

  // Import
  const fileRef = useRef<HTMLInputElement>(null);
  const [strategy, setStrategy] = useState<'merge' | 'replace'>('merge');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    getVipStatus().then(setVip).catch(() => { /* silent */ });
  }, []);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error('请输入兑换口令');
      return;
    }
    setRedeeming(true);
    try {
      const result = await redeemVipCode(code.trim());
      setVip(result);
      setCode('');
      // Reflect new tier in the global store so nav/summary update immediately.
      if (user) setUser({ ...user, tier: result.tier, vipExpiresAt: result.vipExpiresAt });
      toast.success(
        result.grantedHours > 0
          ? `兑换成功！获得 ${result.grantedHours} 小时 VIP`
          : '你已是永久 VIP'
      );
    } catch (e) {
      toast.error(extractErrorMessage(e, '兑换失败'));
    } finally {
      setRedeeming(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      await downloadExport({
        format,
        startDate: exportStart || undefined,
        endDate: exportEnd || undefined,
      });
      toast.success(`已导出 ${format.toUpperCase()}`);
    } catch (e) {
      toast.error(extractErrorMessage(e, '导出失败'));
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error('请先选择 JSON 备份文件');
      return;
    }
    if (
      strategy === 'replace' &&
      !confirm('「替换」会先删除你账户里的所有记录再导入，确认继续？')
    ) {
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const result = await importData(payload, strategy);
      setImportResult(result);
      const total = Object.values(result.inserted).reduce((a, b) => a + b, 0);
      toast.success(`导入完成：${total} 条`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        toast.error('JSON 文件格式错误');
      } else {
        toast.error(extractErrorMessage(e, '导入失败'));
      }
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">设置</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        {/* VIP membership */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className={`h-5 w-5 ${vip?.tier === 'vip' ? 'text-amber-500' : 'text-muted-foreground'}`} />
              会员状态
              {vip?.tier === 'vip' && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  VIP
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {vip?.tier === 'vip'
                ? vip.isPermanent
                  ? '永久 VIP — 周总结使用高质量 AI 洞察'
                  : `VIP 有效期至 ${formatExpiry(vip.vipExpiresAt)}`
                : '免费版 — 兑换口令可体验 VIP 高质量 AI 洞察'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="vip-code" className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5" /> 兑换口令
              </Label>
              <div className="flex gap-2">
                <Input
                  id="vip-code"
                  placeholder="输入口令兑换 VIP 试用"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                />
                <Button onClick={handleRedeem} disabled={redeeming}>
                  {redeeming ? '兑换中...' : '兑换'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                兑换可叠加时长。VIP 期间生成的周总结将使用高质量 AI 模型。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" /> 导出数据
            </CardTitle>
            <CardDescription>
              将你的全部记录下载为 JSON（推荐，可重新导入）或 CSV（电子表格）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="exp-start">起始日期（可选）</Label>
                <Input
                  id="exp-start"
                  type="date"
                  value={exportStart}
                  onChange={(e) => setExportStart(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="exp-end">结束日期（可选）</Label>
                <Input
                  id="exp-end"
                  type="date"
                  value={exportEnd}
                  onChange={(e) => setExportEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleExport('json')} disabled={exporting}>
                下载 JSON
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')} disabled={exporting}>
                下载 CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" /> 导入数据
            </CardTitle>
            <CardDescription>
              从之前的 JSON 备份恢复数据
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="imp-file">备份文件 (.json)</Label>
              <Input id="imp-file" ref={fileRef} type="file" accept="application/json,.json" />
            </div>

            <div className="space-y-2">
              <Label>导入策略</Label>
              <div className="space-y-2">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name="strategy"
                    value="merge"
                    checked={strategy === 'merge'}
                    onChange={() => setStrategy('merge')}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium">合并 (merge)</span>
                    <p className="text-xs text-muted-foreground">
                      在现有数据之外追加。每日三省按日期 upsert 合并字段。
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="radio"
                    name="strategy"
                    value="replace"
                    checked={strategy === 'replace'}
                    onChange={() => setStrategy('replace')}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium text-destructive">替换 (replace)</span>
                    <p className="text-xs text-muted-foreground">
                      先清空你账户里的所有记录，再导入。慎用。
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {strategy === 'replace' && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>替换会删除现有的全部 5 类记录，不可恢复。</span>
              </div>
            )}

            <Button onClick={handleImport} disabled={importing}>
              {importing ? '导入中...' : '开始导入'}
            </Button>

            {importResult && (
              <div className="rounded-md border bg-muted/50 p-3 text-sm">
                <div className="font-medium">导入结果（{importResult.strategy}）</div>
                <ul className="mt-1 grid grid-cols-2 gap-x-4 text-muted-foreground">
                  <li>工作：{importResult.inserted.work}</li>
                  <li>朋友：{importResult.inserted.friend}</li>
                  <li>伴侣：{importResult.inserted.partner}</li>
                  <li>感恩：{importResult.inserted.gratitude}</li>
                  <li>三省：{importResult.inserted.reflection}</li>
                  <li>跳过：{importResult.skipped}</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

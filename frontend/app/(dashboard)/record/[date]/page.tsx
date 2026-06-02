'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { addDays, format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkForm, WORK_CATEGORY_LABELS, WORK_EMOTION_LABELS } from '@/components/records/WorkForm';
import { FriendForm, FRIEND_INTERACTION_LABELS } from '@/components/records/FriendForm';
import { PartnerForm, PARTNER_INTERACTION_LABELS } from '@/components/records/PartnerForm';
import { GratitudeForm, GRATITUDE_CATEGORY_LABELS } from '@/components/records/GratitudeForm';
import { CheckInForm } from '@/components/records/CheckInForm';
import { RecordItem, RecordList } from '@/components/records/RecordList';
import {
  getDailyRecords,
  deleteWork,
  deleteFriend,
  deletePartner,
  deleteGratitude,
  type DailyRecords,
} from '@/lib/recordsApi';
import { emotionLabel } from '@/lib/emotions';
import { extractErrorMessage } from '@/lib/api';

const TODAY = () => format(new Date(), 'yyyy-MM-dd');

export default function RecordPage() {
  const params = useParams<{ date: string }>();
  const router = useRouter();
  const date = params.date;

  const [data, setData] = useState<DailyRecords | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'work' | 'friend' | 'partner' | 'gratitude' | 'checkin'>('work');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const d = await getDailyRecords(date);
      setData(d);
    } catch (err) {
      toast.error(extractErrorMessage(err, '加载失败'));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const goto = (offsetDays: number) => {
    const next = format(addDays(parseISO(date), offsetDays), 'yyyy-MM-dd');
    router.push(`/record/${next}`);
  };

  const removeWork = async (id: string) => {
    if (!confirm('删除这条工作记录？')) return;
    await deleteWork(id);
    toast.success('已删除');
    load();
  };
  const removeFriend = async (id: string) => {
    if (!confirm('删除这条朋友记录？')) return;
    await deleteFriend(id);
    toast.success('已删除');
    load();
  };
  const removePartner = async (id: string) => {
    if (!confirm('删除这条伴侣记录？')) return;
    await deletePartner(id);
    toast.success('已删除');
    load();
  };
  const removeGratitude = async (id: string) => {
    if (!confirm('删除这条感恩记录？')) return;
    await deleteGratitude(id);
    toast.success('已删除');
    load();
  };

  if (loading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        加载中...
      </main>
    );
  }

  const isToday = date === TODAY();
  const displayDate = format(parseISO(date), 'yyyy 年 M 月 d 日');

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 rounded-2xl border bg-card p-3 shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => goto(-1)} aria-label="前一天">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            {/* 点击日期主动调起原生日期选择器，可直接选年月日 */}
            <button
              type="button"
              onClick={() => {
                const el = dateInputRef.current;
                if (!el) return;
                // 现代浏览器：主动弹出日历；不支持则聚焦兜底
                if (typeof el.showPicker === 'function') el.showPicker();
                else el.focus();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-accent"
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h1 className="text-lg font-semibold">{displayDate}</h1>
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              max={TODAY()}
              onChange={(e) => {
                if (e.target.value) router.push(`/record/${e.target.value}`);
              }}
              className="sr-only"
              aria-label="选择日期"
              tabIndex={-1}
            />
            {isToday ? (
              <p className="text-xs text-muted-foreground">今天</p>
            ) : (
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => router.push(`/record/${TODAY()}`)}
              >
                回到今天
              </button>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => goto(1)} aria-label="后一天">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="work">工作 {data.work.length > 0 && `(${data.work.length})`}</TabsTrigger>
            <TabsTrigger value="friend">朋友 {data.friends.length > 0 && `(${data.friends.length})`}</TabsTrigger>
            <TabsTrigger value="partner">伴侣 {data.partner.length > 0 && `(${data.partner.length})`}</TabsTrigger>
            <TabsTrigger value="gratitude">感恩 {data.gratitude.length > 0 && `(${data.gratitude.length})`}</TabsTrigger>
            <TabsTrigger value="checkin">每日打卡</TabsTrigger>
          </TabsList>

          {/* WORK */}
          <TabsContent value="work">
            <div className="space-y-4">
              <WorkForm date={date} onCreated={load} />
              <RecordList count={data.work.length} emptyHint="今天还没有工作记录，开始记录一件吧">
                {data.work.map((r) => (
                  <RecordItem
                    key={r.id}
                    title={WORK_CATEGORY_LABELS[r.category]}
                    meta={<span className="text-xs text-muted-foreground">情绪：{WORK_EMOTION_LABELS[r.emotion]}{r.timeSpent && ` · 用时 ${r.timeSpent}`}</span>}
                    content={r.content}
                    importance={r.importance}
                    onDelete={() => removeWork(r.id)}
                  >
                    {r.followUpAction && (
                      <p className="mt-2 text-xs text-muted-foreground">↳ 后续：{r.followUpAction}</p>
                    )}
                  </RecordItem>
                ))}
              </RecordList>
            </div>
          </TabsContent>

          {/* FRIEND */}
          <TabsContent value="friend">
            <div className="space-y-4">
              <FriendForm date={date} onCreated={load} />
              <RecordList count={data.friends.length} emptyHint="今天还没有朋友记录">
                {data.friends.map((r) => (
                  <RecordItem
                    key={r.id}
                    title={r.friendName}
                    meta={<span className="text-xs text-muted-foreground">{FRIEND_INTERACTION_LABELS[r.interactionType]} · {emotionLabel(r.emotion)}</span>}
                    content={r.content}
                    importance={r.importance}
                    onDelete={() => removeFriend(r.id)}
                  />
                ))}
              </RecordList>
            </div>
          </TabsContent>

          {/* PARTNER */}
          <TabsContent value="partner">
            <div className="space-y-4">
              <PartnerForm date={date} onCreated={load} />
              <RecordList count={data.partner.length} emptyHint="今天还没有伴侣记录">
                {data.partner.map((r) => (
                  <RecordItem
                    key={r.id}
                    title={r.partnerName}
                    meta={
                      <span className="text-xs text-muted-foreground">
                        {PARTNER_INTERACTION_LABELS[r.interactionType]} · {emotionLabel(r.emotion)}
                        {r.interactionType === 'argument' && (
                          <span className={r.resolved ? 'ml-2 text-green-600' : 'ml-2 text-orange-600'}>
                            {r.resolved ? '✓ 已解决' : '待解决'}
                          </span>
                        )}
                      </span>
                    }
                    content={r.content}
                    importance={r.importance}
                    onDelete={() => removePartner(r.id)}
                    photoUrl={r.photoUrl}
                  />
                ))}
              </RecordList>
            </div>
          </TabsContent>

          {/* GRATITUDE */}
          <TabsContent value="gratitude">
            <div className="space-y-4">
              <GratitudeForm date={date} onCreated={load} />
              <RecordList count={data.gratitude.length} emptyHint="今天还没有感恩记录，记一件让你感激的小事吧">
                {data.gratitude.map((r) => (
                  <RecordItem
                    key={r.id}
                    title={GRATITUDE_CATEGORY_LABELS[r.category]}
                    meta={<span className="text-xs text-muted-foreground">{r.emotion}</span>}
                    content={r.content}
                    importance={r.impactLevel}
                    onDelete={() => removeGratitude(r.id)}
                  />
                ))}
              </RecordList>
            </div>
          </TabsContent>

          {/* CHECK-IN */}
          <TabsContent value="checkin">
            <CheckInForm date={date} onCheckedIn={load} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
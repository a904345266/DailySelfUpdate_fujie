'use client';

import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordListProps {
  count: number; // for "X / 3 件" hint
  emptyHint?: string;
  children: React.ReactNode;
  className?: string;
}

export function RecordList({ count, emptyHint, children, className }: RecordListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="text-xs text-muted-foreground">
        今日已记录 <span className="font-semibold text-foreground">{count}</span> / 3 件
        {count >= 3 && <span className="ml-1 text-green-600">✓ 已达成</span>}
      </div>
      {count === 0 && emptyHint && (
        <p className="text-sm text-muted-foreground">{emptyHint}</p>
      )}
      {children}
    </div>
  );
}

interface RecordItemProps {
  title: string;
  meta?: React.ReactNode;
  content: string;
  importance?: number;
  onDelete?: () => void;
  children?: React.ReactNode;
  photoUrl?: string | null;
}

export function RecordItem({ title, meta, content, importance, onDelete, children, photoUrl }: RecordItemProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{title}</span>
            {meta}
            {typeof importance === 'number' && (
              <span className="text-yellow-500">{'★'.repeat(importance)}</span>
            )}
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">{content}</p>
          {photoUrl && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img
                src={photoUrl}
                alt="记录照片"
                className="h-32 w-full object-cover"
              />
            </div>
          )}
          {children}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

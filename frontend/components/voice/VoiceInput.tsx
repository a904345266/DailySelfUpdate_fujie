'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Mic, MicOff, RotateCcw, Sparkles, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { refineText } from '@/lib/textApi';
import { extractErrorMessage } from '@/lib/api';

interface VoiceInputProps {
  /** Controlled text value (lets users edit by keyboard too) */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: string;
  disabled?: boolean;
  /** Min height of the transcript area in tailwind units, e.g. "min-h-[120px]" */
  className?: string;
  rows?: number;
}

/**
 * Voice-first input. Big mic button + live transcript + manual editing fallback.
 * - Click mic → start listening, captions stream into the textarea
 * - Click again → stop. Anything finalized is kept in `value`
 * - User can also type/edit freely in the textarea
 */
export function VoiceInput({
  value,
  onChange,
  placeholder = '点击右侧麦克风开始语音输入，或直接键入...',
  language = 'zh-CN',
  disabled,
  className,
  rows = 4,
}: VoiceInputProps) {
  // Snapshot of the textarea content at the moment listening started, so we
  // can append finalized recognition to it without clobbering edits.
  const [baseValue, setBaseValue] = useState<string>(value);

  // AI refine: preview the AI version side-by-side and let the user adopt it.
  const [refining, setRefining] = useState(false);
  const [preview, setPreview] = useState<{ text: string; mode: 'basic' | 'polish' } | null>(null);

  const handleRefine = async () => {
    if (!value.trim()) {
      toast.error('请先输入或录入一些内容');
      return;
    }
    setRefining(true);
    try {
      const res = await refineText(value);
      if (!res.changed) {
        toast.info('内容已经很简洁，无需整理');
        return;
      }
      setPreview({ text: res.text, mode: res.mode });
    } catch (e) {
      toast.error(extractErrorMessage(e, 'AI 整理失败'));
    } finally {
      setRefining(false);
    }
  };

  const adoptPreview = () => {
    if (preview) {
      onChange(preview.text);
      setBaseValue(preview.text);
    }
    setPreview(null);
  };

  const {
    isListening,
    isSupported,
    finalTranscript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  } = useVoiceInput({ language });

  // Whenever a new chunk is finalized, append it to whatever was in the box
  // when the user pressed start.
  useEffect(() => {
    if (!finalTranscript) return;
    const joined = baseValue
      ? baseValue.trimEnd() + (baseValue.endsWith(' ') ? '' : ' ') + finalTranscript
      : finalTranscript;
    onChange(joined);
    // We intentionally don't depend on `onChange` to avoid re-emit loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTranscript]);

  const toggle = () => {
    if (isListening) {
      stop();
    } else {
      setBaseValue(value);
      reset();
      start();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative flex items-start gap-3">
        <div className="flex-1">
          <textarea
            value={interimTranscript ? `${value}${value && !value.endsWith(' ') ? ' ' : ''}${interimTranscript}` : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={cn(
              'w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              isListening && 'ring-2 ring-blue-400'
            )}
          />
        </div>

        <Button
          type="button"
          onClick={toggle}
          disabled={disabled || !isSupported}
          className={cn(
            'flex-shrink-0 h-14 w-14 rounded-full transition-all',
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50'
              : 'bg-blue-500 hover:bg-blue-600 shadow-md'
          )}
          aria-label={isListening ? '停止录音' : '开始录音'}
          title={isListening ? '停止录音' : '开始录音'}
        >
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="text-muted-foreground">
          {!isSupported && (
            <span className="inline-flex items-center gap-1 text-yellow-700">
              <AlertCircle className="h-3.5 w-3.5" />
              当前浏览器不支持语音识别，请使用 Chrome 或 Edge
            </span>
          )}
          {isSupported && isListening && (
            <span className="inline-flex items-center gap-1 text-blue-600">
              <span className="flex gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
              </span>
              正在聆听... 说出你想记录的内容
            </span>
          )}
          {isSupported && !isListening && !error && value && (
            <span className="text-muted-foreground">点击麦克风继续录音，或直接编辑文本</span>
          )}
          {error && (
            <span className="inline-flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              语音错误: {error}
            </span>
          )}
        </div>

        {value && !isListening && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefine}
              disabled={refining || disabled}
              className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 disabled:opacity-50 dark:text-violet-400"
            >
              <Sparkles className={cn('h-3 w-3', refining && 'animate-spin')} />
              {refining ? '整理中…' : 'AI 整理'}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                reset();
                setBaseValue('');
                setPreview(null);
              }}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-3 w-3" /> 清空
            </button>
          </div>
        )}
      </div>

      {/* AI refine preview: original vs AI version, user chooses */}
      {preview && (
        <div className="animate-rise space-y-3 rounded-lg border border-violet-300/50 bg-violet-50/50 p-3 dark:border-violet-500/30 dark:bg-violet-500/5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            {preview.mode === 'polish' ? 'AI 提炼润色（VIP）' : 'AI 精简整理'}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-xs text-muted-foreground">原文</div>
              <div className="whitespace-pre-wrap rounded-md bg-background/60 p-2 text-sm text-muted-foreground">
                {value}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">AI 版本</div>
              <div className="whitespace-pre-wrap rounded-md bg-background p-2 text-sm text-foreground ring-1 ring-violet-300/50 dark:ring-violet-500/30">
                {preview.text}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(null)}>
              <X className="mr-1 h-3.5 w-3.5" /> 放弃
            </Button>
            <Button type="button" size="sm" onClick={adoptPreview}>
              <Check className="mr-1 h-3.5 w-3.5" /> 采用
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

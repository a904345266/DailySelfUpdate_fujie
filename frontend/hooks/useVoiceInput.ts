'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Minimal Web Speech API types — TS doesn't ship these in lib.dom by default
type SRConstructor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SREvent) => void) | null;
  onerror: ((event: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SREvent {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

interface SRErrorEvent {
  error: string;
  message?: string;
}

declare global {
  interface Window {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  }
}

export interface UseVoiceInputOptions {
  language?: string; // e.g. "zh-CN", "en-US"
  continuous?: boolean;
  interimResults?: boolean;
  onFinalTranscript?: (text: string) => void;
}

export interface UseVoiceInputResult {
  isListening: boolean;
  isSupported: boolean;
  finalTranscript: string; // accumulated finalized text since last reset()
  interimTranscript: string; // tentative text currently being recognized
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const {
    language = 'zh-CN',
    continuous = true,
    interimResults = true,
    onFinalTranscript,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinalTranscript);
  onFinalRef.current = onFinalTranscript;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    const rec = new Ctor();
    rec.lang = language;
    rec.continuous = continuous;
    rec.interimResults = interimResults;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SREvent) => {
      let interim = '';
      let appended = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          appended += text;
        } else {
          interim += text;
        }
      }
      if (appended) {
        setFinalTranscript((prev) => {
          const next = prev + appended;
          onFinalRef.current?.(next);
          return next;
        });
      }
      setInterimTranscript(interim);
    };

    rec.onerror = (event: SRErrorEvent) => {
      // "no-speech" and "aborted" happen routinely; surface only meaningful ones
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(event.error);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = rec;

    return () => {
      try { rec.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    };
  }, [language, continuous, interimResults]);

  const start = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setError(null);
    setInterimTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [isListening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    finalTranscript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  };
}

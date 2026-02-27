import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechRecognitionState } from '../types';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognition(): (new () => any) | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechRecognitionState>({
    isSupported: !!getSpeechRecognition(),
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const shouldBeListeningRef = useRef(false);
  const onResultCallbackRef = useRef<((transcript: string) => void) | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: prev.transcript + final,
        interimTranscript: interim,
      }));

      if (final && onResultCallbackRef.current) {
        onResultCallbackRef.current(final);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Don't stop listening on 'no-speech' — just keep going
      if (event.error === 'no-speech') return;

      setState(prev => ({
        ...prev,
        error: event.error,
        isListening: false,
      }));
      shouldBeListeningRef.current = false;
    };

    recognition.onend = () => {
      if (shouldBeListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Already running
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldBeListeningRef.current = false;
      recognition.abort();
    };
  }, []);

  const startListening = useCallback((onResult?: (transcript: string) => void) => {
    if (!recognitionRef.current) return;

    onResultCallbackRef.current = onResult ?? null;
    shouldBeListeningRef.current = true;

    setState(prev => ({
      ...prev,
      isListening: true,
      transcript: '',
      interimTranscript: '',
      error: null,
    }));

    try {
      recognitionRef.current.start();
    } catch {
      // Already running
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    shouldBeListeningRef.current = false;

    setState(prev => ({
      ...prev,
      isListening: false,
    }));

    recognitionRef.current.stop();
    onResultCallbackRef.current = null;
  }, []);

  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}

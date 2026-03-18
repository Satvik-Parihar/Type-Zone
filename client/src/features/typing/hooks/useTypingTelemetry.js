import { useCallback, useMemo, useRef, useState } from 'react';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function computeCorrectAndErrors(value, prompt) {
  const maxIndex = Math.min(value.length, prompt.length);
  let correctChars = 0;
  let errorCount = 0;

  for (let i = 0; i < maxIndex; i += 1) {
    if (value[i] === prompt[i]) {
      correctChars += 1;
    } else {
      errorCount += 1;
    }
  }

  if (value.length > prompt.length) {
    errorCount += value.length - prompt.length;
  }

  return { correctChars, errorCount };
}

function buildConsistency(intervals) {
  if (intervals.length < 3) return 100;

  const average = intervals.reduce((sum, item) => sum + item, 0) / intervals.length;
  if (average <= 0) return 100;

  const variance = intervals.reduce((sum, item) => sum + ((item - average) ** 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  const consistency = 100 - ((stdDev / average) * 100);
  return Math.round(clamp(consistency, 0, 100));
}

export function useTypingTelemetry() {
  const [inputValue, setInputValue] = useState('');

  const keystrokeTimelineRef = useRef([]);
  const keyMistakesRef = useRef({});
  const intervalsRef = useRef([]);
  const activeErrorIndexesRef = useRef(new Set());
  const correctionPatternsRef = useRef({
    backspaceCorrections: 0,
    replacedErrors: 0
  });
  const previousTimestampRef = useRef(0);

  const resetTelemetry = useCallback(() => {
    setInputValue('');
    keystrokeTimelineRef.current = [];
    keyMistakesRef.current = {};
    intervalsRef.current = [];
    activeErrorIndexesRef.current = new Set();
    correctionPatternsRef.current = {
      backspaceCorrections: 0,
      replacedErrors: 0
    };
    previousTimestampRef.current = 0;
  }, []);

  const applyInput = useCallback((nextValue, prompt) => {
    const now = Date.now();
    const previousValue = inputValue;

    const deltaMs = previousTimestampRef.current > 0 ? now - previousTimestampRef.current : 0;
    if (deltaMs > 0) {
      intervalsRef.current.push(deltaMs);
      if (intervalsRef.current.length > 2000) {
        intervalsRef.current = intervalsRef.current.slice(-2000);
      }
    }
    previousTimestampRef.current = now;

    if (nextValue.length < previousValue.length) {
      const deletedFrom = nextValue.length;
      for (const index of Array.from(activeErrorIndexesRef.current)) {
        if (index >= deletedFrom) {
          correctionPatternsRef.current.backspaceCorrections += 1;
          activeErrorIndexesRef.current.delete(index);
        }
      }

      keystrokeTimelineRef.current.push({
        key: 'Backspace',
        expectedKey: '',
        timestamp: now,
        deltaMs,
        position: nextValue.length,
        isError: false,
        isCorrection: true
      });
    } else if (nextValue.length >= previousValue.length) {
      const start = previousValue.length;
      const inserted = nextValue.slice(start);

      for (let idx = 0; idx < inserted.length; idx += 1) {
        const char = inserted[idx];
        const position = start + idx;
        const expectedKey = prompt[position] || '';
        const isError = expectedKey ? char !== expectedKey : true;

        if (isError) {
          const lookup = expectedKey || char;
          keyMistakesRef.current[lookup] = (keyMistakesRef.current[lookup] || 0) + 1;
          activeErrorIndexesRef.current.add(position);
        } else if (activeErrorIndexesRef.current.has(position)) {
          correctionPatternsRef.current.replacedErrors += 1;
          activeErrorIndexesRef.current.delete(position);
        }

        keystrokeTimelineRef.current.push({
          key: char,
          expectedKey,
          timestamp: now,
          deltaMs,
          position,
          isError,
          isCorrection: false
        });
      }
    }

    setInputValue(nextValue);
    return nextValue;
  }, [inputValue]);

  const buildMetrics = useCallback((prompt, timeElapsedSeconds) => {
    const elapsed = Math.max(1, timeElapsedSeconds || 1);
    const { correctChars, errorCount } = computeCorrectAndErrors(inputValue, prompt);

    const wpm = Math.round(((correctChars / 5) * 60) / elapsed);
    const rawWpm = Math.round((((inputValue.length || 0) / 5) * 60) / elapsed);
    const accuracy = inputValue.length > 0
      ? Math.round((correctChars / inputValue.length) * 100)
      : 100;
    const consistency = buildConsistency(intervalsRef.current);
    const keystrokesPerSecond = Number((keystrokeTimelineRef.current.length / elapsed).toFixed(2));

    return {
      wpm: Math.max(0, wpm),
      rawWpm: Math.max(0, rawWpm),
      accuracy: clamp(accuracy, 0, 100),
      errorCount,
      consistency,
      keystrokesPerSecond
    };
  }, [inputValue]);

  const telemetryPayload = useMemo(() => ({
    inputValue,
    keystrokeTimeline: keystrokeTimelineRef.current,
    keyMistakes: keyMistakesRef.current,
    correctionPatterns: correctionPatternsRef.current
  }), [inputValue]);

  const topKeyMistakes = useMemo(() => {
    return Object.entries(keyMistakesRef.current)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [inputValue]);

  return {
    inputValue,
    applyInput,
    resetTelemetry,
    buildMetrics,
    telemetryPayload,
    topKeyMistakes
  };
}

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export const useTypingEngine = (text, mode = 'time', duration = 60) => {
  const [input, setInput] = useState('');
  const [errors, setErrors] = useState(new Set());
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef(null);
  const startTime = useRef(null);
  const endTime = useRef(null);
  const timerRef = useRef(null);
  const prevInputRef = useRef('');
  const wpmHistoryRef = useRef([]);
  const sampleIntervalRef = useRef(null);
  const keyAccuracyRef = useRef({});
  const keystrokeTimelineRef = useRef([]);

  const resetTest = useCallback(() => {
    setInput('');
    setErrors(new Set());
    setIsActive(false);
    setIsFinished(false);
    startTime.current = null;
    endTime.current = null;
    prevInputRef.current = '';
    wpmHistoryRef.current = [];
    keyAccuracyRef.current = {};
    keystrokeTimelineRef.current = [];

    if (sampleIntervalRef.current) {
      clearInterval(sampleIntervalRef.current);
      sampleIntervalRef.current = null;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishTest = useCallback(() => {
    setIsFinished(true);
    setIsActive(false);
    endTime.current = Date.now();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (sampleIntervalRef.current) {
      clearInterval(sampleIntervalRef.current);
      sampleIntervalRef.current = null;
    }
  }, []);

  const startTest = useCallback(() => {
    if (!isActive) {
      resetTest();
      setIsActive(true);
      startTime.current = Date.now();
      inputRef.current?.focus();
      // start sampling WPM every second
      sampleIntervalRef.current = window.setInterval(() => {
        const elapsedSeconds = startTime.current ? Math.max((Date.now() - startTime.current) / 1000, 0) : 0;
        const charactersTyped = prevInputRef.current.length;
        const minutes = Math.max(elapsedSeconds / 60, 0.01);
        const currentWpm = Math.round((charactersTyped / 5) / minutes) || 0;
        wpmHistoryRef.current.push(currentWpm);
      }, 1000);
    }
  }, [isActive, resetTest]);

  const handleInput = useCallback(
    (value) => {
      if (!isActive || isFinished) return;

      const nextInput = value;
      setInput(nextInput);

      const nextErrors = new Set();
      const checkLength = Math.max(nextInput.length, text.length);

      for (let index = 0; index < checkLength; index += 1) {
        if (nextInput[index] !== text[index]) {
          nextErrors.add(index);
        }
      }

      setErrors(nextErrors);

      // detect newly typed characters (simple append detection)
      const prev = prevInputRef.current || '';
      if (nextInput.length > prev.length && startTime.current) {
        for (let i = prev.length; i < nextInput.length; i += 1) {
          const typedChar = nextInput[i];
          const expectedChar = text[i] || '';
          const correct = typedChar === expectedChar;
          const t = (Date.now() - startTime.current) / 1000;

          // update keystroke timeline
          keystrokeTimelineRef.current.push({ t, typedChar, expectedChar, correct });

          // update key accuracy for expected char (normalize to lowercase)
          const key = (expectedChar || typedChar || '').toLowerCase();
          if (!keyAccuracyRef.current[key]) keyAccuracyRef.current[key] = { correct: 0, total: 0 };
          keyAccuracyRef.current[key].total += 1;
          if (correct) keyAccuracyRef.current[key].correct += 1;
        }
      }
      prevInputRef.current = nextInput;

      if (mode === 'words') {
        const completedWords = nextInput.trim().split(/\s+/).filter(Boolean).length;
        if (completedWords >= duration) {
          finishTest();
        }
      }

      if (mode === 'time' && nextInput.length >= text.length) {
        finishTest();
      }
    },
    [text, isActive, isFinished, duration, mode, finishTest]
  );

  useEffect(() => {
    if (mode === 'time' && isActive && !isFinished) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        finishTest();
      }, duration * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [mode, duration, isActive, isFinished, finishTest]);

  const currentIndex = input.length;

  const metrics = useMemo(() => {
    const elapsedSeconds = startTime.current ? Math.max(((endTime.current || Date.now()) - startTime.current) / 1000, 0) : 0;
    const charactersTyped = input.length;
    const wordsTyped = Math.max(0, input.trim().split(/\s+/).filter(Boolean).length);
    const minutes = Math.max(elapsedSeconds / 60, 0.01);
    const wpm = Math.round((charactersTyped / 5) / minutes);
    const correctChars = Math.max(charactersTyped - errors.size, 0);
    const accuracy = charactersTyped > 0 ? Math.round((correctChars / charactersTyped) * 100) : 100;
    const timeLeft = mode === 'time' && isActive ? Math.max(duration - Math.round(elapsedSeconds), 0) : 0;

    // derive key accuracy percentages
    const rawKeyAcc = keyAccuracyRef.current || {};
    const keyAccuracy = Object.keys(rawKeyAcc).reduce((acc, k) => {
      const item = rawKeyAcc[k];
      acc[k] = item.total > 0 ? Math.round((item.correct / item.total) * 100) : null;
      return acc;
    }, {});

    return {
      wpm: Number.isFinite(wpm) ? wpm : 0,
      accuracy,
      errorCount: errors.size,
      correct: correctChars,
      time: Math.round(elapsedSeconds),
      words: wordsTyped,
      timeLeft,
      isFinished,
      wpmHistory: Array.from(wpmHistoryRef.current || []),
      keyAccuracy,
      keystrokeTimeline: Array.from(keystrokeTimelineRef.current || []),
    };
  }, [input, errors, duration, isActive, mode]);

  return {
    input,
    currentIndex,
    errors,
    isActive,
    isFinished,
    metrics,
    startTest,
    resetTest,
    handleInput,
    inputRef,
  };
};

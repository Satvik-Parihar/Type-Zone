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

  const resetTest = useCallback(() => {
    setInput('');
    setErrors(new Set());
    setIsActive(false);
    setIsFinished(false);
    startTime.current = null;
    endTime.current = null;

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
  }, []);

  const startTest = useCallback(() => {
    if (!isActive) {
      resetTest();
      setIsActive(true);
      startTime.current = Date.now();
      inputRef.current?.focus();
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

    return {
      wpm: Number.isFinite(wpm) ? wpm : 0,
      accuracy,
      errors: errors.size,
      correct: correctChars,
      time: Math.round(elapsedSeconds),
      words: wordsTyped,
      timeLeft,
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

import { useCallback, useEffect, useRef } from 'react';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function useAudioEngine({
  soundEnabled,
  keypressSoundEnabled,
  ambienceEnabled,
  ambienceVolume,
  typingSoundProfile
}) {
  const audioContextRef = useRef(null);
  const ambienceNodeRef = useRef(null);
  const ambienceGainRef = useRef(null);

  const ensureContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  }, []);

  const playKeypress = useCallback(() => {
    if (!soundEnabled || !keypressSoundEnabled) return;
    const context = ensureContext();
    if (!context) return;

    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();

    const profile = {
      classic: { type: 'square', frequency: 620, decay: 0.035, volume: 0.018 },
      soft: { type: 'sine', frequency: 560, decay: 0.06, volume: 0.015 },
      clicky: { type: 'triangle', frequency: 860, decay: 0.03, volume: 0.022 },
      mechanical: { type: 'square', frequency: 1200, decay: 0.025, volume: 0.025 },
      typewriter: { type: 'triangle', frequency: 440, decay: 0.08, volume: 0.02 },
      spring: { type: 'sine', frequency: 1500, decay: 0.05, volume: 0.018 },
      silent: { type: 'sine', frequency: 500, decay: 0.01, volume: 0 }
    }[typingSoundProfile || 'classic'];

    osc.type = profile.type;
    osc.frequency.value = profile.frequency;

    gain.gain.setValueAtTime(profile.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.decay);

    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now);
    osc.stop(now + Math.max(0.02, profile.decay));
  }, [ensureContext, keypressSoundEnabled, soundEnabled, typingSoundProfile]);

  useEffect(() => {
    const context = ensureContext();
    if (!context) return;

    if (!ambienceEnabled || !soundEnabled) {
      if (ambienceNodeRef.current) {
        try {
          ambienceNodeRef.current.stop();
        } catch (_error) {
          // Ignore stop race.
        }
        ambienceNodeRef.current.disconnect();
        ambienceNodeRef.current = null;
      }
      if (ambienceGainRef.current) {
        ambienceGainRef.current.disconnect();
        ambienceGainRef.current = null;
      }
      return;
    }

    if (!ambienceNodeRef.current) {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = 'sine';
      osc.frequency.value = 82;
      gain.gain.value = clamp(ambienceVolume ?? 0.2, 0, 1) * 0.08;

      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();

      ambienceNodeRef.current = osc;
      ambienceGainRef.current = gain;
    } else if (ambienceGainRef.current) {
      ambienceGainRef.current.gain.value = clamp(ambienceVolume ?? 0.2, 0, 1) * 0.08;
    }

    return () => {};
  }, [ambienceEnabled, ambienceVolume, ensureContext, soundEnabled]);

  useEffect(() => {
    return () => {
      if (ambienceNodeRef.current) {
        try {
          ambienceNodeRef.current.stop();
        } catch (_error) {
          // Ignore stop race.
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playKeypress
  };
}

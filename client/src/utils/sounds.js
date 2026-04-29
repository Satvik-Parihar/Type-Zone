import { Howl } from 'howler';

// Sound effects for typing
const sounds = {
  keypress: new Howl({
    src: ['/sounds/keypress.mp3'],
    volume: 0.3,
    preload: true,
    onloaderror: function() {
      console.warn('Failed to load keypress sound');
    }
  }),
  error: new Howl({
    src: ['/sounds/error.mp3'],
    volume: 0.4,
    preload: true,
    onloaderror: function() {
      console.warn('Failed to load error sound');
    }
  }),
  complete: new Howl({
    src: ['/sounds/complete.mp3'],
    volume: 0.5,
    preload: true,
    onloaderror: function() {
      console.warn('Failed to load complete sound');
    }
  }),
};

// Get volume setting from localStorage (0-100)
const getVolumeMultiplier = () => {
  try {
    const saved = localStorage.getItem('typezone_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      return Math.max(0, Math.min(1, settings.volume / 100));
    }
  } catch (e) {
    console.warn('Failed to read volume setting:', e);
  }
  return 0.7; // default 70%
};

export const playSound = (soundName) => {
  if (sounds[soundName]) {
    try {
      const volumeMultiplier = getVolumeMultiplier();
      const baseVolume = sounds[soundName]._volume;
      sounds[soundName].volume(baseVolume * volumeMultiplier);
      sounds[soundName].play();
    } catch (e) {
      console.warn(`Failed to play ${soundName}:`, e);
    }
  }
};

export const setSoundEnabled = (enabled) => {
  Howler.mute(!enabled);
};

export const isSoundEnabled = () => !Howler._muted;
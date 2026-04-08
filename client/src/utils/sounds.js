import { Howl } from 'howler';

// Sound effects for typing
const sounds = {
  keypress: new Howl({
    src: ['/sounds/keypress.mp3'], // You'll need to add these sound files
    volume: 0.3,
  }),
  error: new Howl({
    src: ['/sounds/error.mp3'],
    volume: 0.4,
  }),
  complete: new Howl({
    src: ['/sounds/complete.mp3'],
    volume: 0.5,
  }),
};

export const playSound = (soundName) => {
  if (sounds[soundName]) {
    sounds[soundName].play();
  }
};

export const setSoundEnabled = (enabled) => {
  Howler.mute(!enabled);
};

export const isSoundEnabled = () => !Howler._muted;
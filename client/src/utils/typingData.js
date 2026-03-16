export const textSamples = {
  english: {
    words: [
      'jump', 'table', 'ocean', 'bright', 'cup', 'fast', 'yellow', 'globe', 'moon', 'river',
      'lamp', 'code', 'apple', 'desk', 'dream', 'plane', 'zebra', 'storm', 'kind', 'silver',
      'happy', 'tiny', 'beach', 'robot', 'phone', 'novel', 'quiet', 'bridge', 'track', 'sun',
      'pencil', 'light', 'fence', 'door', 'jungle', 'grape', 'cloud', 'fox', 'breeze', 'whale',
      'window', 'magic', 'peace', 'sharp', 'flower', 'carrot', 'turtle', 'market', 'puzzle', 'island'
    ],
    paragraphs: [
      'The technology industry evolves rapidly, and small daily improvements in typing speed can dramatically improve productivity over time.',
      'Consistency beats intensity in skill building. A focused typing session every day creates visible progress in both speed and confidence.',
      'Great software engineers optimize communication, and fast accurate typing helps transform ideas into readable code and documentation.'
    ],
    quotes: [
      'The best way to predict the future is to create it. - Peter Drucker',
      'Success is the sum of small efforts repeated day in and day out. - Robert Collier',
      'Quality is not an act, it is a habit. - Aristotle'
    ],
    numbers: [
      '9812 7743 1109 4521 9088 3321 4176 9322 6118',
      '2026 101 808 4096 73 999 15000 321 64 2048',
      '42 512 2048 65535 777 88 9090 1337 8080'
    ],
    punctuation: [
      'Hello, world! Ready to type: fast, accurate, and consistent?',
      'Numbers (1, 2, 3) and symbols #, %, &, * must be handled correctly.',
      'Practice makes progress; progress builds confidence.'
    ],
    code: [
      'const result = data.filter(item => item.active).map(item => item.value);',
      'async function fetchProfile(id) { const response = await api.get(`/users/${id}`); return response.data; }',
      'if (accuracy >= 95 && wpm > 80) { unlockAchievement("precision-master"); }'
    ]
  }
};

export const themes = {
  dark: {
    name: 'Graphite Dark',
    bg: '#17181c',
    panel: '#242733',
    text: '#f5f7ff',
    muted: '#9ea7be',
    accent: '#3ea6ff',
    success: '#22c55e',
    error: '#ef4444'
  },
  light: {
    name: 'Professional Light',
    bg: '#f2f6fb',
    panel: '#ffffff',
    text: '#0f172a',
    muted: '#475569',
    accent: '#0ea5e9',
    success: '#16a34a',
    error: '#dc2626'
  },
  matrix: {
    name: 'Matrix Neon',
    bg: '#050706',
    panel: '#0e140f',
    text: '#c2ffd0',
    muted: '#83b98f',
    accent: '#34d399',
    success: '#22c55e',
    error: '#f87171'
  }
};

export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateWordSet(words, wordCount) {
  const selected = [];
  while (selected.length < wordCount) {
    const chunk = shuffle(words).slice(0, Math.min(words.length, wordCount - selected.length));
    selected.push(...chunk);
  }
  return selected.join(' ');
}

export function generatePrompt(mode, wordCount, language = 'english') {
  const bank = textSamples[language];
  if (mode === 'paragraph') {
    return bank.paragraphs[Math.floor(Math.random() * bank.paragraphs.length)];
  }
  if (mode === 'quote') {
    return bank.quotes[Math.floor(Math.random() * bank.quotes.length)];
  }
  if (mode === 'numbers') {
    return bank.numbers[Math.floor(Math.random() * bank.numbers.length)];
  }
  if (mode === 'punctuation') {
    return bank.punctuation[Math.floor(Math.random() * bank.punctuation.length)];
  }
  if (mode === 'code') {
    return bank.code[Math.floor(Math.random() * bank.code.length)];
  }
  return generateWordSet(bank.words, wordCount);
}

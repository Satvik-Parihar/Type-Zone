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
        'The best way to predict the future is to create it.',
        'Success is the sum of small efforts repeated day in and day out.',
        'Quality is not an act, it is a habit.',
        'The only limit to our realization of tomorrow is our doubts of today.',
        'Do not wait to strike till the iron is hot; but make it hot by striking.',
        'Whether you think you can or you think you can’t, you’re right.',
        'The secret of getting ahead is getting started.',
        'It always seems impossible until it’s done.',
        'Change your thoughts and you change your world.',
        'The future depends on what you do today.',
        'What you do today can improve all your tomorrows.',
        'The only way to do great work is to love what you do.',
        'If you want to lift yourself up, lift up someone else.',
        'Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.',
        'The journey of a thousand miles begins with one step.',
        'Act as if what you do makes a difference. It does.',
        'We become what we repeatedly do. Excellence, then, is not an act but a habit.',
        'Either you run the day or the day runs you.',
        'The harder I work, the luckier I get.',
        'The future belongs to those who believe in the beauty of their dreams.',
        'Courage is resistance to fear, mastery of fear — not absence of fear.',
        'Happiness is not something ready made. It comes from your own actions.',
        'Do what you can, with what you have, where you are.',
        'Success usually comes to those who are too busy to be looking for it.',
        'The only real mistake is the one from which we learn nothing.',
        'Your time is limited, so don’t waste it living someone else’s life.',
        'The best revenge is massive success.',
        'What lies behind us and what lies before us are tiny matters compared to what lies within us.',
        'You miss 100% of the shots you don’t take.',
        'A person who never made a mistake never tried anything new.',
        'Dream big and dare to fail.',
        'If you’re offered a seat on a rocket ship, don’t ask what seat. Just get on.',
        'Do one thing every day that scares you.',
        'The only impossible journey is the one you never begin.',
        'Everything you can imagine is real.',
        'Turn your wounds into wisdom.',
        'Start where you are. Use what you have. Do what you can.',
        'The mind is everything. What you think you become.',
        'Small daily improvements over time lead to stunning results.',
        'The way to get started is to quit talking and begin doing.',
        'Great things never came from comfort zones.',
        'If opportunity doesn’t knock, build a door.',
        'Don’t let yesterday take up too much of today.',
        'If you want to achieve greatness stop asking for permission.',
        'I find that the harder I work, the more luck I seem to have.'
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
      'if (accuracy >= 95 && wpm > 80) { unlockAchievement("precision-master"); }',
      'const unique = [...new Set(array)];',
      'const sum = arr.reduce((s, v) => s + v, 0);',
      'function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }',
      'for (let i = 0; i < n; i++) { console.log(i); }',
      'const map = new Map(); map.set(key, value);',
      'const userNames = users.map(u => u.name).join(", ");',
      'fetch(url).then(r => r.json()).then(data => console.log(data));',
      'def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)',
      'squares = [x**2 for x in range(10)]',
      'with open("file.txt") as f: data = f.read()',
      'class Node:\n    def __init__(self, v):\n        self.val = v\n        self.next = None',
      'func add(a int, b int) int { return a + b }',
      'go func() { fmt.Println("hello") }()',
      'package main\nimport "fmt"\nfunc main() { fmt.Println("Hello") }',
      'if err != nil { return nil, err }',
      'const PI = 3.14159',
      'arr := make([]int, 0, 10)',
      'let promise = new Promise((res, rej) => res(42));',
      'try { risky() } catch (e) { console.error(e) }',
      'def quicksort(a):\n    if len(a) < 2: return a\n    pivot = a[0]\n    return quicksort([x for x in a[1:] if x < pivot]) + [pivot] + quicksort([x for x in a[1:] if x >= pivot])',
      'const http = require("http"); http.createServer((req, res) => { res.end("ok"); }).listen(3000);',
      'const obj = { a: 1, b: { c: 3 } }; const clone = JSON.parse(JSON.stringify(obj));',
      'let result = array.flatMap(x => x.items);',
      'def generator():\n    i = 0\n    while True:\n        yield i\n        i += 1',
      'select { case msg := <-ch: fmt.Println(msg) default: fmt.Println("no msg") }',
      'const fs = require("fs"); fs.writeFileSync("out.txt", "data");',
      'let sorted = arr.sort((a,b) => a - b);',
      'const regex = /\\w+@\\w+\\.\\w+/g; const emails = text.match(regex) || [];' 
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
  },
  cyberpunk: {
    name: 'Cyberpunk Grid',
    bg: '#0b0520',
    panel: '#170d36',
    text: '#f9c8ff',
    muted: '#c084fc',
    accent: '#22d3ee',
    success: '#4ade80',
    error: '#fb7185'
  },
  dracula: {
    name: 'Dracula',
    bg: '#282a36',
    panel: '#1e1f29',
    text: '#f8f8f2',
    muted: '#bd93f9',
    accent: '#8be9fd',
    success: '#50fa7b',
    error: '#ff5555'
  },
  retro: {
    name: 'Retro Terminal',
    bg: '#081b09',
    panel: '#102811',
    text: '#b9ff8f',
    muted: '#6fbf62',
    accent: '#facc15',
    success: '#84cc16',
    error: '#f87171'
  }
};

export const codeSnippets = {
  javascript: [
    'const result = data.filter(item => item.active).map(item => item.value);',
    'const unique = [...new Set(array)];',
    'const sum = arr.reduce((s, v) => s + v, 0);',
    'function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }',
    'for (let i = 0; i < n; i++) { console.log(i); }',
    'const map = new Map(); map.set(key, value);',
    'const userNames = users.map(u => u.name).join(", ");',
    'fetch(url).then(r => r.json()).then(data => console.log(data));',
    'const regex = /\\w+@\\w+\\.\\w+/g; const emails = text.match(regex) || [];',
    'const fs = require("fs"); fs.writeFileSync("out.txt", "data");',
    'let sorted = arr.sort((a,b) => a - b);',
    'let promise = new Promise((res, rej) => res(42));',
    'const obj = { a: 1, b: { c: 3 } }; const clone = JSON.parse(JSON.stringify(obj));'
  ],
  python: [
    'def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)',
    'squares = [x**2 for x in range(10)]',
    'with open("file.txt") as f: data = f.read()',
    'class Node:\n    def __init__(self, v):\n        self.val = v\n        self.next = None',
    'def quicksort(a):\n    if len(a) < 2: return a\n    pivot = a[0]\n    return quicksort([x for x in a[1:] if x < pivot]) + [pivot] + quicksort([x for x in a[1:] if x >= pivot])',
    'def generator():\n    i = 0\n    while True:\n        yield i\n        i += 1',
    'import json\nobj = json.loads(text)\nprint(obj)',
    'result = [x for x in arr if x % 2 == 0]'
  ],
  go: [
    'package main\nimport "fmt"\nfunc main() { fmt.Println("Hello") }',
    'func add(a int, b int) int { return a + b }',
    'go func() { fmt.Println("hello") }()',
    'if err != nil { return nil, err }',
    'arr := make([]int, 0, 10)',
    'select { case msg := <-ch: fmt.Println(msg) default: fmt.Println("no msg") }'
  ]
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
  if (mode === 'sentence') {
    const paragraph = bank.paragraphs[Math.floor(Math.random() * bank.paragraphs.length)];
    return paragraph.split('.').find((part) => part.trim())?.trim().concat('.') || paragraph;
  }
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
    // language argument for code mode may specify a programming language
    try {
      const snippets = codeSnippets[language] || bank.code || [];
      return snippets[Math.floor(Math.random() * snippets.length)];
    } catch (e) {
      return bank.code[Math.floor(Math.random() * bank.code.length)];
    }
  }
  if (mode === 'custom') {
    return bank.paragraphs[Math.floor(Math.random() * bank.paragraphs.length)];
  }
  if (mode === 'zen' || mode === 'practice' || mode === 'challenge' || mode === 'time') {
    return generateWordSet(bank.words, Math.max(120, wordCount));
  }
  return generateWordSet(bank.words, wordCount);
}

const textPool = {
    words: [
        'function', 'array', 'object', 'promise', 'render', 'optimize', 'engine', 'cursor',
        'network', 'monitor', 'deploy', 'performance', 'syntax', 'variable', 'express', 'mongo',
        'typing', 'client', 'server', 'feature', 'analytics', 'socket', 'leaderboard', 'challenge'
    ],
    quotes: [
        'Quality is not an act, it is a habit. - Aristotle',
        'Success is the sum of small efforts repeated day in and day out. - Robert Collier',
        'The best way to predict the future is to create it. - Peter Drucker'
    ],
    code: [
        'const result = data.filter(item => item.active).map(item => item.value);',
        'async function fetchProfile(id) { const response = await api.get(`/users/${id}`); return response.data; }',
        'if (accuracy >= 95 && wpm > 80) { unlockAchievement("precision-master"); }'
    ],
    punctuation: [
        'Hello, world! Ready to type: fast, accurate, and consistent?',
        'Numbers (1, 2, 3) and symbols #, %, &, * must be handled correctly.',
        'Practice makes progress; progress builds confidence.'
    ],
    numbers: [
        '9812 7743 1109 4521 9088 3321 4176',
        '2026 101 808 4096 73 999 15000',
        '42 512 2048 65535 777 88 9090'
    ]
};

function shuffle(list) {
    const clone = [...list];
    for (let i = clone.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
}

function generateWordTest(wordCount) {
    const selected = [];
    while (selected.length < wordCount) {
        selected.push(...shuffle(textPool.words).slice(0, Math.min(wordCount - selected.length, textPool.words.length)));
    }
    return selected.join(' ');
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function buildTypingText(mode, options = {}) {
    const { wordCount = 25 } = options;
    if (mode === 'words') return generateWordTest(wordCount);
    if (mode === 'quote') return pickRandom(textPool.quotes);
    if (mode === 'code') return pickRandom(textPool.code);
    if (mode === 'numbers') return pickRandom(textPool.numbers);
    if (mode === 'punctuation') return pickRandom(textPool.punctuation);
    return pickRandom(textPool.quotes);
}

module.exports = {
    buildTypingText
};

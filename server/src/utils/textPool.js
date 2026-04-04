const crypto = require('crypto');

const commonWords = [
    'about', 'above', 'across', 'action', 'active', 'adapt', 'after', 'again', 'agent', 'agree', 'ahead', 'allow', 'almost', 'alone', 'along', 'always',
    'answer', 'anyone', 'appear', 'around', 'arrive', 'assist', 'author', 'balance', 'basic', 'become', 'before', 'behind', 'belief', 'better', 'beyond',
    'bridge', 'bright', 'budget', 'build', 'camera', 'career', 'center', 'change', 'choice', 'choose', 'client', 'cloud', 'collab', 'common', 'create',
    'custom', 'daily', 'data', 'debug', 'define', 'deploy', 'design', 'detail', 'device', 'digital', 'direct', 'domain', 'driven', 'easy', 'editor',
    'effect', 'effort', 'enable', 'engine', 'enough', 'ensure', 'event', 'every', 'evolve', 'exact', 'expert', 'export', 'factor', 'feature', 'feedback',
    'filter', 'finish', 'flight', 'focus', 'format', 'future', 'global', 'growth', 'handle', 'health', 'impact', 'improve', 'insight', 'intent', 'invite',
    'journey', 'launch', 'leader', 'learn', 'length', 'listen', 'market', 'memory', 'method', 'metric', 'modern', 'module', 'monitor', 'motion', 'network',
    'normal', 'notice', 'object', 'optimize', 'output', 'owner', 'panel', 'people', 'perform', 'phase', 'plan', 'policy', 'portal', 'predict', 'prepare',
    'present', 'process', 'product', 'profile', 'project', 'prompt', 'public', 'quality', 'queue', 'quick', 'random', 'render', 'report', 'request', 'result',
    'review', 'rhythm', 'sample', 'scale', 'schema', 'score', 'search', 'secure', 'select', 'server', 'session', 'signal', 'simple', 'smooth', 'socket',
    'source', 'speed', 'stable', 'state', 'status', 'stream', 'system', 'target', 'theme', 'timing', 'token', 'topic', 'track', 'travel', 'update', 'upload',
    'user', 'value', 'vision', 'volume', 'window', 'worker', 'world', 'write'
];

const technicalWords = [
    'abstraction', 'acknowledge', 'aggregation', 'algorithm', 'analytics', 'asynchronous', 'backpressure', 'benchmark', 'blueprint', 'cacheability',
    'capability', 'checkpoint', 'concurrency', 'consistency', 'containerization', 'correlation', 'cybersecurity', 'decomposition', 'dependency',
    'deterministic', 'distributed', 'encapsulation', 'encryption', 'eventual', 'federation', 'granularity', 'horizontal', 'hypermedia', 'idempotent',
    'immutability', 'inference', 'instrumentation', 'integration', 'interceptor', 'latency', 'loadbalancer', 'matchmaking', 'microservice', 'middleware',
    'migration', 'modularity', 'normalization', 'observability', 'orchestration', 'parallelism', 'partitioning', 'persistence', 'pipeline', 'polymorphism',
    'prioritization', 'profiling', 'provisioning', 'queryable', 'randomization', 'reconciliation', 'redundancy', 'refactoring', 'resilience', 'serialization',
    'sharding', 'specialization', 'synchronization', 'telemetry', 'throughput', 'tokenization', 'validation', 'virtualization'
];

const rareWords = [
    'abstruse', 'aesthete', 'arcadian', 'auspicious', 'blithesome', 'circumspect', 'confluence', 'didactic', 'effulgent', 'equanimity', 'esoteric',
    'facetious', 'fastidious', 'florid', 'fortuitous', 'garrulous', 'gregarious', 'hallowed', 'idiosyncratic', 'incandescent', 'ineffable', 'juxtapose',
    'lachrymose', 'luminous', 'mellifluous', 'meticulous', 'nocturnal', 'obdurate', 'oblique', 'palimpsest', 'paradox', 'perspicacious', 'quintessential',
    'recondite', 'reticent', 'sagacious', 'serendipity', 'sonder', 'surreptitious', 'tenacity', 'transient', 'ubiquitous', 'verisimilitude', 'wistful'
];

const quotes = [
    'You cannot improve what you do not measure. - Peter Drucker',
    'Discipline is choosing between what you want now and what you want most. - Abraham Lincoln',
    'Every strike brings me closer to the next home run. - Babe Ruth',
    'The hard days are what make you stronger. - Aly Raisman',
    'Simplicity is prerequisite for reliability. - Edsger W. Dijkstra',
    'First solve the problem. Then write the code. - John Johnson',
    'The secret of getting ahead is getting started. - Mark Twain'
];

const codeSnippets = [
    'const result = users.filter((u) => u.active).map((u) => ({ id: u.id, score: u.score }));',
    'async function fetchProfile(id) { const { data } = await api.get(`/users/${id}`); return data; }',
    'if (accuracy >= 97 && wpm > 90) { unlockAchievement("precision-master"); }',
    'for (const [key, value] of Object.entries(heatmap)) { total += value; }',
    'const socket = io(url, { transports: ["websocket"], reconnection: true });',
    'export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));',
    'router.post("/submit", requireAuth, validateBody(schema), asyncHandler(submit));'
];

const punctuationTemplates = [
    'Ready, set, type! Accuracy first; speed follows naturally.',
    'Numbers (1, 2, 3), symbols #, %, &, *, and punctuation must stay precise.',
    'Practice daily: improve rhythm, reduce errors, and sharpen consistency.',
    'High speed without control causes chaos; controlled speed builds mastery.'
];

const numberTemplates = [
    '4021 9514 7783 1205 6399 8842 1730 5612 0091',
    '2026 144 4096 16384 32768 65535 73 88 999',
    '42 512 2048 8192 1337 2701 8080 9090 1122'
];

const markovCorpus = [
    'Typing at a professional level depends on rhythm not panic',
    'Consistency emerges when you stay relaxed and keep your hands light',
    'Fast typists minimize hesitation by chunking words into patterns',
    'When error rates rise reduce speed briefly and recover form',
    'Precision under pressure is a trainable skill with deliberate repetition',
    'The best training loops include challenge feedback and reflection'
];

const prefixes = ['auto', 'hyper', 'micro', 'meta', 'multi', 'inter', 'infra', 'ultra', 'proto', 'neo', 'cyber', 'quant', 'trans', 'poly', 'crypto'];
const stems = ['graph', 'logic', 'craft', 'metric', 'script', 'layer', 'stack', 'flow', 'scope', 'pulse', 'stream', 'cache', 'vector', 'pattern', 'signal'];
const suffixes = ['able', 'ing', 'tion', 'ment', 'ity', 'er', 'ive', 'ary', 'less', 'ful', 'wise', 'core', 'shift', 'loop', 'form'];

const recentHashes = [];
const recentHashSet = new Set();
const RECENT_LIMIT = 1000;

function unique(list) {
    return Array.from(new Set(list));
}

function buildSyntheticBank(minSize = 12000) {
    const generated = [];
    const connectors = ['x', 'v', 'z', 'n', 'r', 'q', 'k', 'm', 't', 'l'];

    for (const prefix of prefixes) {
        for (const stem of stems) {
            for (const suffix of suffixes) {
                generated.push(`${prefix}${stem}${suffix}`);
                for (const connector of connectors) {
                    generated.push(`${prefix}${stem}${connector}${suffix}`);
                }
                if (generated.length >= minSize) {
                    return generated;
                }
            }
        }
    }

    return generated;
}

const syntheticWords = buildSyntheticBank();
const massiveWordBank = unique([...commonWords, ...technicalWords, ...rareWords, ...syntheticWords]);

const weightedByDifficulty = {
    easy: [
        { words: commonWords, weight: 8 },
        { words: punctuationTemplates.flatMap((line) => line.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)), weight: 2 }
    ],
    medium: [
        { words: commonWords, weight: 6 },
        { words: technicalWords, weight: 3 },
        { words: rareWords, weight: 1 }
    ],
    hard: [
        { words: technicalWords, weight: 5 },
        { words: rareWords, weight: 3 },
        { words: commonWords, weight: 2 }
    ],
    expert: [
        { words: technicalWords, weight: 4 },
        { words: rareWords, weight: 4 },
        { words: massiveWordBank.filter((word) => word.length >= 10), weight: 2 }
    ]
};

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(list) {
    return list[randInt(0, list.length - 1)];
}

function hashText(text) {
    return crypto.createHash('sha1').update(text).digest('hex');
}

function rememberText(text) {
    const hash = hashText(text);
    recentHashes.push(hash);
    recentHashSet.add(hash);

    if (recentHashes.length > RECENT_LIMIT) {
        const oldest = recentHashes.shift();
        if (oldest) {
            recentHashSet.delete(oldest);
        }
    }
}

function ensureNotRecentlyUsed(generate) {
    for (let i = 0; i < 8; i += 1) {
        const text = generate();
        if (!recentHashSet.has(hashText(text))) {
            rememberText(text);
            return text;
        }
    }

    const fallback = generate();
    rememberText(fallback);
    return fallback;
}

function weightedPick(entries) {
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
    let target = Math.random() * total;

    for (const entry of entries) {
        target -= entry.weight;
        if (target <= 0) {
            return pickRandom(entry.words);
        }
    }

    return pickRandom(entries[entries.length - 1].words);
}

function buildMarkovGraph(sentences) {
    const graph = new Map();

    for (const sentence of sentences) {
        const tokens = sentence.split(/\s+/).filter(Boolean);
        for (let i = 0; i < tokens.length - 1; i += 1) {
            const key = tokens[i].toLowerCase();
            const next = tokens[i + 1];
            if (!graph.has(key)) {
                graph.set(key, []);
            }
            graph.get(key).push(next);
        }
    }

    return graph;
}

const markovGraph = buildMarkovGraph(markovCorpus);

function generateMarkovSentence(minWords = 8, maxWords = 16) {
    const targetWords = randInt(minWords, maxWords);
    let current = pickRandom(commonWords);
    const tokens = [current.charAt(0).toUpperCase() + current.slice(1)];

    for (let i = 1; i < targetWords; i += 1) {
        const transitions = markovGraph.get(current.toLowerCase());
        const next = transitions && transitions.length > 0
            ? pickRandom(transitions)
            : weightedPick(weightedByDifficulty.medium);
        tokens.push(next);
        current = next;
    }

    const punctuation = pickRandom(['.', '.', '.', '!', '?']);
    return `${tokens.join(' ')}${punctuation}`;
}

function generateWordSequence(wordCount, difficulty, weakKeys = []) {
    const entries = weightedByDifficulty[difficulty] || weightedByDifficulty.medium;
    const nextWords = [];
    const priorityKeys = weakKeys.map((key) => String(key).toLowerCase()).filter(Boolean);

    while (nextWords.length < wordCount) {
        let candidate = weightedPick(entries);

        if (priorityKeys.length > 0 && Math.random() < 0.55) {
            const matching = massiveWordBank.filter((word) =>
                priorityKeys.some((key) => word.includes(key))
            );
            if (matching.length > 0) {
                candidate = pickRandom(matching);
            }
        }

        nextWords.push(candidate);
    }

    return nextWords.join(' ');
}

function generateSentence(difficulty) {
    if (difficulty === 'easy') {
        const words = generateWordSequence(randInt(8, 12), 'easy').split(' ');
        return `${words.map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)).join(' ')}.`;
    }

    if (difficulty === 'expert') {
        return `${generateMarkovSentence(12, 20)} ${pickRandom(punctuationTemplates)}`;
    }

    return generateMarkovSentence();
}

function generateParagraph(difficulty, sentenceCount = randInt(3, 6)) {
    const sentences = [];
    for (let i = 0; i < sentenceCount; i += 1) {
        sentences.push(generateSentence(difficulty));
    }
    return sentences.join(' ');
}

function generateCodeSnippet(difficulty) {
    if (difficulty === 'easy') {
        return 'const speed = metrics.wpm; const accuracy = metrics.accuracy;';
    }
    if (difficulty === 'expert') {
        return [pickRandom(codeSnippets), 'const drift = Math.abs(rawWpm - wpm) > 15 ? "instability" : "stable";', 'if (drift === "instability") coach.enqueue("slow down for 10 seconds");'].join(' ');
    }
    return pickRandom(codeSnippets);
}

function normalizeDifficulty(inputDifficulty) {
    const allowed = ['easy', 'medium', 'hard', 'expert'];
    if (!inputDifficulty || !allowed.includes(inputDifficulty)) return 'medium';
    return inputDifficulty;
}

function buildTypingText(mode, options = {}) {
    const {
        wordCount = 25,
        difficulty: inputDifficulty,
        weakKeys = [],
        customText = ''
    } = options;

    const difficulty = normalizeDifficulty(inputDifficulty);

    return ensureNotRecentlyUsed(() => {
        if (mode === 'custom') {
            return customText.trim().slice(0, 2500) || generateParagraph(difficulty, 2);
        }

        if (mode === 'words' || mode === 'time' || mode === 'zen') {
            const targetCount = mode === 'time' || mode === 'zen' ? Math.max(wordCount, 140) : wordCount;
            return generateWordSequence(targetCount, difficulty, weakKeys);
        }

        if (mode === 'practice') {
            return generateWordSequence(wordCount, 'medium', weakKeys);
        }

        if (mode === 'sentence') {
            return generateSentence(difficulty);
        }

        if (mode === 'paragraph' || mode === 'challenge') {
            return generateParagraph(difficulty);
        }

        if (mode === 'quote') {
            return pickRandom(quotes);
        }

        if (mode === 'code') {
            return generateCodeSnippet(difficulty);
        }

        if (mode === 'numbers') {
            return pickRandom(numberTemplates);
        }

        if (mode === 'punctuation') {
            return pickRandom(punctuationTemplates);
        }

        return generateWordSequence(wordCount, difficulty, weakKeys);
    });
}

module.exports = {
    buildTypingText,
    normalizeDifficulty,
    __internal: {
        generateWordSequence,
        generateSentence,
        generateParagraph,
        generateCodeSnippet,
        massiveWordBankSize: massiveWordBank.length
    }
};

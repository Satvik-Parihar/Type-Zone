const test = require('node:test');
const assert = require('node:assert/strict');
const { buildTypingText, __internal } = require('../src/utils/textPool');

test('massive word bank is large enough', () => {
    assert.ok(__internal.massiveWordBankSize >= 10000);
});

test('buildTypingText supports multiple advanced modes', () => {
    const words = buildTypingText('words', { wordCount: 40, difficulty: 'easy' });
    const paragraph = buildTypingText('paragraph', { difficulty: 'hard' });
    const code = buildTypingText('code', { difficulty: 'expert' });

    assert.ok(words.split(' ').length >= 40);
    assert.ok(paragraph.length > 50);
    assert.ok(code.includes('const') || code.includes('function') || code.includes('router'));
});

test('custom mode returns user text when provided', () => {
    const custom = buildTypingText('custom', { customText: 'custom text payload' });
    assert.equal(custom, 'custom text payload');
});

const crypto = require('crypto');
const { buildTypingText } = require('../utils/textPool');

function getDailyChallenge(req, res) {
    const date = new Date().toISOString().slice(0, 10);
    const textId = crypto.createHash('sha1').update(`daily-${date}`).digest('hex').slice(0, 16);
    const modes = ['quote', 'paragraph', 'code'];
    const mode = modes[new Date().getDate() % modes.length];

    res.status(200).json({
        date,
        challenge: {
            textId,
            mode,
            difficulty: 'hard',
            text: buildTypingText(mode, { difficulty: 'hard', wordCount: 80 })
        }
    });
}

module.exports = {
    getDailyChallenge
};

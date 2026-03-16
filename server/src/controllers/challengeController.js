const crypto = require('crypto');
const { buildTypingText } = require('../utils/textPool');

function getDailyChallenge(req, res) {
    const date = new Date().toISOString().slice(0, 10);
    const textId = crypto.createHash('sha1').update(`daily-${date}`).digest('hex').slice(0, 16);

    res.status(200).json({
        date,
        challenge: {
            textId,
            mode: 'quote',
            text: buildTypingText('quote')
        }
    });
}

module.exports = {
    getDailyChallenge
};

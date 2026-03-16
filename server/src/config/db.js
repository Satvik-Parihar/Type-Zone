const mongoose = require('mongoose');

async function connectDb() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGO_URI is not configured');
    }

    await mongoose.connect(mongoUri, {
        dbName: process.env.MONGO_DB_NAME || 'typezone'
    });
}

module.exports = {
    connectDb
};

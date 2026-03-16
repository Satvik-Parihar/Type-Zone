function getCorsOptions() {
    return {
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        credentials: true
    };
}

module.exports = {
    getCorsOptions
};

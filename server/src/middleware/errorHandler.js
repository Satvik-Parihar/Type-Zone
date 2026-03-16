const { ApiError } = require('../utils/ApiError');

function notFoundHandler(req, res) {
    res.status(404).json({ message: 'Resource not found' });
}

function errorHandler(err, req, res, next) {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            message: err.message,
            details: err.details || null
        });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
}

module.exports = {
    notFoundHandler,
    errorHandler
};

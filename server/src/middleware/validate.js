const { ApiError } = require('../utils/ApiError');

function validateBody(schema) {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        req.body = parsed.data;
        return next();
    };
}

module.exports = {
    validateBody
};
const { ApiError } = require('../utils/ApiError');
const User = require('../models/User');

function requireAdmin(req, res, next) {
    if (!req.auth || !req.auth.userId) {
        throw new ApiError(401, 'Unauthorized');
    }

    User.findById(req.auth.userId)
        .select('isAdmin')
        .then((user) => {
            if (!user || !user.isAdmin) {
                throw new ApiError(403, 'Admin access required');
            }
            next();
        })
        .catch((error) => {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            res.status(500).json({ message: 'Internal server error' });
        });
}

module.exports = { requireAdmin };

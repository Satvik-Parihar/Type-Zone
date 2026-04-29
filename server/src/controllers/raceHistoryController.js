const RaceHistory = require('../models/RaceHistory');

async function getRaceHistory(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [races, total] = await Promise.all([
    RaceHistory.find({ userId: req.auth.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    RaceHistory.countDocuments({ userId: req.auth.userId })
  ]);

  res.status(200).json({
    races,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}

module.exports = {
  getRaceHistory
};
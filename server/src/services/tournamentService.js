const Tournament = require('../models/Tournament');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

function dayKey(date) {
    return date.toISOString().slice(0, 10);
}

function weeklyKey(date) {
    const copy = new Date(date);
    copy.setUTCHours(0, 0, 0, 0);
    const day = copy.getUTCDay();
    const diff = (day + 6) % 7;
    copy.setUTCDate(copy.getUTCDate() - diff);
    return `week-${dayKey(copy)}`;
}

async function ensureUpcomingTournaments() {
    const now = new Date();

    const dailyStart = new Date(now);
    dailyStart.setUTCHours(18, 0, 0, 0);
    if (dailyStart <= now) {
        dailyStart.setUTCDate(dailyStart.getUTCDate() + 1);
    }
    const dailyEnd = new Date(dailyStart);
    dailyEnd.setUTCHours(23, 59, 59, 999);

    const weeklyStart = new Date(now);
    weeklyStart.setUTCHours(16, 0, 0, 0);
    while (weeklyStart.getUTCDay() !== 6) {
        weeklyStart.setUTCDate(weeklyStart.getUTCDate() + 1);
    }
    const weeklyEnd = new Date(weeklyStart);
    weeklyEnd.setUTCDate(weeklyEnd.getUTCDate() + 1);

    const defs = [
        {
            key: `daily-${dayKey(dailyStart)}`,
            title: `Daily Sprint ${dayKey(dailyStart)}`,
            mode: 'time',
            difficulty: 'hard',
            startsAt: dailyStart,
            endsAt: dailyEnd,
            rewardXp: 250
        },
        {
            key: weeklyKey(weeklyStart),
            title: `Weekly Tournament ${weeklyKey(weeklyStart).replace('week-', '')}`,
            mode: 'paragraph',
            difficulty: 'expert',
            startsAt: weeklyStart,
            endsAt: weeklyEnd,
            rewardXp: 1000
        }
    ];

    for (const def of defs) {
        await Tournament.findOneAndUpdate(
            { key: def.key },
            { $setOnInsert: def },
            { upsert: true, new: true }
        );
    }

    await Tournament.updateMany(
        { status: 'scheduled', startsAt: { $lte: now } },
        { $set: { status: 'active' } }
    );

    await Tournament.updateMany(
        { status: { $in: ['scheduled', 'active'] }, endsAt: { $lt: now } },
        { $set: { status: 'completed' } }
    );
}

function scoreFormula(wpm, accuracy) {
    return Math.round((wpm * 0.8) + (accuracy * 0.2));
}

async function listTournaments() {
    await ensureUpcomingTournaments();

    const items = await Tournament.find({
        status: { $in: ['scheduled', 'active'] }
    })
        .sort({ startsAt: 1 })
        .limit(20)
        .lean();

    return items;
}

async function joinTournament({ tournamentId, userId, username }) {
    await ensureUpcomingTournaments();

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        throw new ApiError(404, 'Tournament not found');
    }

    if (!['scheduled', 'active'].includes(tournament.status)) {
        throw new ApiError(400, 'Tournament is not open for joining');
    }

    const exists = tournament.participants.some((participant) => String(participant.userId) === String(userId));
    if (!exists) {
        tournament.participants.push({ userId, username });
        await tournament.save();
    }

    return tournament;
}

async function submitTournamentResult({ tournamentId, userId, wpm, accuracy }) {
    await ensureUpcomingTournaments();

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        throw new ApiError(404, 'Tournament not found');
    }

    const participant = tournament.participants.find((entry) => String(entry.userId) === String(userId));
    if (!participant) {
        throw new ApiError(400, 'Join the tournament before submitting a result');
    }

    participant.wpm = Math.max(participant.wpm || 0, wpm);
    participant.accuracy = Math.max(participant.accuracy || 0, accuracy);
    participant.score = scoreFormula(participant.wpm, participant.accuracy);

    const ranked = [...tournament.participants].sort((a, b) => b.score - a.score);
    ranked.forEach((entry, index) => {
        entry.rank = index + 1;
    });

    if (!participant.rewardClaimed) {
        let xpAward = 0;
        if (participant.rank === 1) xpAward = tournament.rewardXp;
        else if (participant.rank === 2) xpAward = Math.round(tournament.rewardXp * 0.6);
        else if (participant.rank === 3) xpAward = Math.round(tournament.rewardXp * 0.35);
        else xpAward = Math.round(tournament.rewardXp * 0.1);

        participant.xpAwarded = xpAward;
        participant.rewardClaimed = true;

        const user = await User.findById(userId);
        if (user) {
            user.typingStats.xp = (user.typingStats.xp || 0) + xpAward;
            user.typingStats.level = Math.max(1, Math.floor(user.typingStats.xp / 400) + 1);
            await user.save();
        }
    }

    await tournament.save();

    return {
        id: tournament._id,
        participant,
        top: ranked.slice(0, 10)
    };
}

async function getMyTournaments(userId) {
    await ensureUpcomingTournaments();

    return Tournament.find({
        'participants.userId': userId
    })
        .sort({ startsAt: -1 })
        .limit(20)
        .lean();
}

async function createTournament({ title, mode, difficulty, startsAt, endsAt, rewardXp }) {
    const now = new Date();
    if (new Date(startsAt) < now) {
        throw new ApiError(400, 'Tournament start time must be in the future');
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
        throw new ApiError(400, 'Tournament end time must be after start time');
    }

    const tournament = new Tournament({
        key: `manual-${Date.now()}`,
        title,
        mode,
        difficulty,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        rewardXp,
        status: 'scheduled',
        participants: []
    });

    await tournament.save();
    return tournament;
}

async function updateTournament(tournamentId, updates) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        throw new ApiError(404, 'Tournament not found');
    }

    if (updates.status && !['scheduled', 'active', 'completed'].includes(updates.status)) {
        throw new ApiError(400, 'Invalid tournament status');
    }

    Object.assign(tournament, updates);
    await tournament.save();
    return tournament;
}

async function deleteTournament(tournamentId) {
    const tournament = await Tournament.findByIdAndDelete(tournamentId);
    if (!tournament) {
        throw new ApiError(404, 'Tournament not found');
    }
    return tournament;
}

module.exports = {
    ensureUpcomingTournaments,
    listTournaments,
    joinTournament,
    submitTournamentResult,
    getMyTournaments,
    createTournament,
    updateTournament,
    deleteTournament
};

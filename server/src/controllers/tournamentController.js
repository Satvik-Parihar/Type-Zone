const { z } = require('zod');
const { ApiError } = require('../utils/ApiError');
const {
    listTournaments,
    joinTournament,
    submitTournamentResult,
    getMyTournaments,
    createTournament,
    updateTournament,
    deleteTournament
} = require('../services/tournamentService');

const joinSchema = z.object({
    tournamentId: z.string().min(1)
});

const submitSchema = z.object({
    tournamentId: z.string().min(1),
    wpm: z.number().min(0),
    accuracy: z.number().min(0).max(100)
});

async function getSchedule(req, res) {
    const tournaments = await listTournaments();
    res.status(200).json({ tournaments });
}

async function join(req, res) {
    const parsed = joinSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, 'Invalid tournament join payload', parsed.error.flatten());
    }
    const tournament = await joinTournament({
        tournamentId: parsed.data.tournamentId,
        userId: req.auth.userId,
        username: req.auth.username
    });

    res.status(200).json({
        tournamentId: tournament._id,
        status: tournament.status
    });
}

async function submit(req, res) {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, 'Invalid tournament submit payload', parsed.error.flatten());
    }
    const result = await submitTournamentResult({
        tournamentId: parsed.data.tournamentId,
        userId: req.auth.userId,
        wpm: parsed.data.wpm,
        accuracy: parsed.data.accuracy
    });

    res.status(200).json(result);
}

async function mine(req, res) {
    const tournaments = await getMyTournaments(req.auth.userId);
    res.status(200).json({ tournaments });
}

const createSchema = z.object({
    title: z.string().min(1).max(100),
    mode: z.enum(['words', 'time', 'quote', 'code', 'sentence', 'paragraph', 'challenge']),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    rewardXp: z.number().min(50).max(10000)
});

async function create(req, res) {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, 'Invalid tournament creation payload', parsed.error.flatten());
    }
    const tournament = await createTournament(parsed.data);
    res.status(201).json({ tournament });
}

const updateSchema = z.object({
    status: z.enum(['scheduled', 'active', 'completed']).optional(),
    title: z.string().min(1).max(100).optional(),
    rewardXp: z.number().min(50).max(10000).optional()
});

async function update(req, res) {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ApiError(400, 'Invalid tournament update payload', parsed.error.flatten());
    }
    const tournament = await updateTournament(req.params.id, parsed.data);
    res.status(200).json({ tournament });
}

async function remove(req, res) {
    await deleteTournament(req.params.id);
    res.status(204).send();
}

module.exports = {
    getSchedule,
    join,
    submit,
    mine,
    create,
    update,
    remove
};

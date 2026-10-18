const router = require('express').Router();
const teamController = require('../controllers/teamController');
const { verifyTeam } = require('../middleware/auth');

// GET  /api/teams/availability   -> which teams are registered
router.get('/availability', teamController.availability);

// POST /api/teams/session -> validate predefined team + participants
router.post('/session', teamController.session);

// POST /api/teams/register        -> register a team (once)
router.post('/register', teamController.register);

// POST /api/teams/login           -> login to an already-registered team
router.post('/login', teamController.login);

// GET  /api/teams/me              -> current team (token required)
router.get('/me', verifyTeam, teamController.me);

module.exports = router;

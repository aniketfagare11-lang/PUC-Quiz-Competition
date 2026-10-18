const router = require('express').Router();
const attemptController = require('../controllers/attemptController');
const { verifyTeam } = require('../middleware/auth');

// All attempt routes require a team token
router.use(verifyTeam);

// POST /api/attempts/start         { round }
router.post('/start', attemptController.start);

// GET  /api/attempts/:id
router.get('/:id', attemptController.get);

// PUT  /api/attempts/:id/answer    { questionId, selectedOption }
router.put('/:id/answer', attemptController.saveAnswer);

// POST /api/attempts/:id/submit
router.post('/:id/submit', attemptController.submit);

module.exports = router;

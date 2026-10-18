const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

// All admin routes require an admin token
router.use(verifyAdmin);

// GET    /api/admin/overview
router.get('/overview', adminController.overview);

// GET    /api/admin/teams
router.get('/teams', adminController.teams);

// GET    /api/admin/rankings
router.get('/rankings', adminController.rankings);
router.get('/results/combined', adminController.combinedResults);

// POST   /api/admin/attempts/:id/force-submit
router.post('/attempts/:id/force-submit', adminController.forceSubmit);

// DELETE /api/admin/teams/:teamNumber/reset
router.delete('/teams/:teamNumber/reset', adminController.resetAttempt);

// Question management
router.get('/questions', adminController.questions);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

module.exports = router;

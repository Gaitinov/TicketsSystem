const Router = require('express');
const router = new Router();
const controller = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/list', authMiddleware, controller.getNotifications);
router.delete('/:id', authMiddleware, controller.deleteNotification);

module.exports = router;

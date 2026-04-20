const Notification = require('../models/Notification');

class NotificationController {
    async getNotifications(req, res, next) {
        try {
            const notifications = await Notification.find({ userId: req.user.id }).sort({ date: -1 }).limit(50);
            res.json({ notifications });
        } catch (e) {
            next(e);
        }
    }

    async deleteNotification(req, res, next) {
        try {
            await Notification.deleteOne({ _id: req.params.id, userId: req.user.id });
            res.json({ success: true });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new NotificationController();

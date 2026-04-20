const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    type: {
        type: String,
        default: 'INFO',
        enum: ['INFO', 'WARNING', 'ERROR']
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});


module.exports = model('Notification', NotificationSchema);

const { Schema, model } = require('mongoose');

const User = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    roles: [{ type: String, ref: 'Role' }],
    notifications: [{
        ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' },
        type: {
            type: String,
            required: true,
            enum: ['INFO', 'WARNING', 'ERROR']
        },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        date: { type: Date, default: Date.now }
    }]
});

module.exports = model('User', User);

const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    roles: [{ type: String }],
    isVerified: { type: Boolean, default: false }
});

module.exports = model('User', UserSchema);

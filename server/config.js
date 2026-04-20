require('dotenv').config();

const secret = process.env.JWT_SECRET;
if (!secret) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in .env file.');
}

module.exports = {
    secret: secret,
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myDatabase",
    gmailUser: process.env.GMAIL_USER,
    gmailPass: process.env.GMAIL_PASS,
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000"
};

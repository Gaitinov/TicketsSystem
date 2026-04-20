const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { validationResult } = require('express-validator');
const { secret, clientUrl, gmailUser, gmailPass } = require("../config");

const generateAccessToken = (id, roles) => {
    const payload = { id, roles };
    return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class AuthController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "Ошибка валидации", errors: errors.array() });
            }

            const { username, email, password } = req.body;
            const hashPassword = await bcrypt.hash(password, 12);
            
            const user = new User({ 
                username, 
                email, 
                password: hashPassword, 
                roles: ['USER'], 
                isVerified: false 
            });

            try {
                await user.save();
            } catch (saveError) {
                if (saveError.code === 11000) {
                    return res.status(400).json({ message: "Пользователь с таким именем или email уже существует" });
                }
                throw saveError;
            }

            const emailToken = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: gmailUser, pass: gmailPass }
            });

            const mailOptions = {
                from: `"TicketsSystem" <${gmailUser}>`,
                to: email,
                subject: "Подтверждение почты",
                text: `${clientUrl}/confirmation/${emailToken}`
            };

            try {
                await transporter.sendMail(mailOptions);
            } catch (mailError) {
                return res.status(500).json({ 
                    message: "Пользователь зарегистрирован, но письмо не отправлено (ошибка почтового сервера)." 
                });
            }
            
            return res.json({ message: "Подтвердите почту" });
        } catch (e) {
            next(e);
        }
    }

    async resendConfirmation(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ message: "Email обязателен" });

            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: "Пользователь не найден" });
            if (user.isVerified) return res.status(400).json({ message: "Почта уже подтверждена" });

            const emailToken = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: gmailUser, pass: gmailPass }
            });

            const mailOptions = {
                from: `"TicketsSystem" <${gmailUser}>`,
                to: email,
                subject: "Подтверждение почты",
                text: `${clientUrl}/confirmation/${emailToken}`
            };

            await transporter.sendMail(mailOptions);
            return res.json({ message: "Письмо отправлено повторно" });
        } catch (e) {
            next(e);
        }
    }

    async confirmEmail(req, res, next) {
        try {
            const { token } = req.params;
            const payload = jwt.verify(token, secret);
            const user = await User.findById(payload.userId);

            if (!user) {
                return res.render('confirmation', { message: 'Пользователь не найден', success: false });
            }

            if (user.isVerified) {
                return res.render('confirmation', { message: 'Почта уже подтверждена', success: true });
            }

            user.isVerified = true;
            await user.save();

            return res.render('confirmation', { message: 'Почта успешно подтверждена!', success: true });
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ message: "Неверные данные" });
            }

            if (!user.isVerified) {
                return res.status(400).json({ message: "Подтвердите почту" });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: "Неверные данные" });
            }

            const token = generateAccessToken(user._id, user.roles);
            return res.json({ token });
        } catch (e) {
            next(e);
        }
    }

    async recoverPassword(req, res, next) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

            const dynamicSecret = secret + user.password;
            const resetToken = jwt.sign({ userId: user.id }, dynamicSecret, { expiresIn: '1h' });

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: gmailUser, pass: gmailPass }
            });

            const mailOptions = {
                from: `"TicketsSystem" <${gmailUser}>`,
                to: email,
                subject: "Восстановление пароля",
                text: `${clientUrl}/resetpassword/${resetToken}`
            };

            await transporter.sendMail(mailOptions);
            return res.json({ message: 'Инструкции отправлены' });
        } catch (e) {
            next(e);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "Ошибка валидации", errors: errors.array() });
            }

            const { token } = req.params;
            const { password } = req.body;

            let payload;
            try {
                payload = jwt.decode(token);
                if (!payload || !payload.userId) {
                    throw new Error("Invalid payload");
                }
            } catch (jwtError) {
                return res.status(400).json({ message: 'Неверный формат токена' });
            }

            const user = await User.findById(payload.userId);
            if (!user) {
                return res.status(400).json({ message: 'Пользователь не найден' });
            }

            const dynamicSecret = secret + user.password;
            try {
                jwt.verify(token, dynamicSecret);
            } catch (jwtError) {
                return res.status(400).json({ message: 'Неверный или просроченный токен' });
            }

            const hashPassword = await bcrypt.hash(password, 12);
            user.password = hashPassword;
            await user.save();

            return res.json({ message: 'Пароль изменен' });
        } catch (e) {
            next(e);
        }
    }

    async check(req, res, next) {
        try {
            const token = generateAccessToken(req.user.id, req.user.roles);
            return res.json({ token });
        } catch (e) {
            next(e);
        }
    }

    async getUserInfo(req, res, next) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: "Пользователь не найден" });
            
            res.json({
                username: user.username,
                roles: user.roles
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new AuthController();

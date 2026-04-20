const Router = require('express');
const router = new Router();
const controller = require('../controllers/authController');
const { check } = require("express-validator");
const authMiddleware = require('../middleware/authMiddleware');

router.post('/registration', [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 4 и меньше 20 символов").isLength({ min: 4, max: 20 }),
    check('email', "Некорректный email").isEmail()
], controller.registration);

router.post('/resend-confirmation', controller.resendConfirmation);

router.post('/login', controller.login);
router.post('/recoverypassword', controller.recoverPassword);
router.post('/resetpassword/:token', [
    check('password', "Пароль должен быть больше 4 и меньше 20 символов").isLength({ min: 4, max: 20 })
], controller.resetPassword);

router.get('/check', authMiddleware, controller.check);
router.get('/userinfo', authMiddleware, controller.getUserInfo);

module.exports = router;

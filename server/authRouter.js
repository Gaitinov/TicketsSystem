const Router = require('express')
const router = new Router()
const controller = require('./authController')
const { check } = require("express-validator")
const authMiddleware = require('./middlewaree/authMiddleware')
const roleMiddleware = require('./middlewaree/roleMiddleware')

router.post('/registration', [
    check('username', "Имя пользователя не может быть пустым").notEmpty(),
    check('password', "Пароль должен быть больше 4 и меньше 10 символов").isLength({ min: 4, max: 10 })
], controller.registration)
router.post('/login', controller.login)
router.post(
    '/ticket/create',
    authMiddleware,
    [
        check('title', 'Поле темы должно быть заполнено').notEmpty(),
        check('description', 'Поле описания должно быть заполнено').notEmpty(),
    ],
    controller.createTicket
);
router.post('/ticket/:id/addmessage', authMiddleware, controller.addMessageToTicket);
router.get('/users', roleMiddleware(["ADMIN"]), controller.getUsers)
router.get('/auth', authMiddleware, controller.check)
router.get('/userinfo', authMiddleware, controller.getUserInfo);
router.get('/userdata', authMiddleware, controller.getUserData);
router.get('/ticketdata/:id', authMiddleware, controller.getTicketData);
router.put('/closeticket/:id', authMiddleware, controller.closeTicket);

module.exports = router
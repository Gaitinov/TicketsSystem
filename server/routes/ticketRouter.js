const Router = require('express');
const router = new Router();
const controller = require('../controllers/ticketController');
const { check } = require("express-validator");
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post(
    '/create',
    authMiddleware,
    [
        check('title', 'Required').notEmpty(),
        check('description', 'Required').notEmpty(),
    ],
    controller.createTicket
);

router.post('/:id/addmessage', authMiddleware, controller.addMessageToTicket);
router.get('/my', authMiddleware, controller.getUserData);


router.get('/all', authMiddleware, roleMiddleware(['ADMIN']), controller.getAllTickets);
router.put('/:id/close', authMiddleware, controller.closeTicket);
router.put('/:id/open', authMiddleware, controller.openTicket);

router.get('/:id', authMiddleware, controller.getTicketData);

module.exports = router;

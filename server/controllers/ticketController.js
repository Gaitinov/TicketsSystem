const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
};

class TicketController {
    async createTicket(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: "Ошибка валидации", errors: errors.array() });
            }

            const { title, description } = req.body;
            const userId = req.user.id;

            const openTicketCount = await Ticket.countDocuments({ author: userId, status: 'open' });
            if (openTicketCount >= 3) {
                return res.status(400).json({ message: 'Достигнут лимит открытых тикетов (3)' });
            }

            const user = await User.findById(userId);
            const newTicket = new Ticket({
                title,
                author: userId,
                authorUsername: user.username,
                description,
                messages: []
            });

            await newTicket.save();

            const admins = await User.find({ roles: 'ADMIN' });
            const notifications = admins.map(admin => ({
                userId: admin._id,
                ticketId: newTicket._id,
                message: `Создан новый тикет: ${title}`
            }));

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }

            res.status(201).json({ data: newTicket });
        } catch (e) {
            next(e);
        }
    }

    async addMessageToTicket(req, res, next) {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Некорректный ID тикета' });
            }

            const { content } = req.body;
            if (!content || content.trim() === '') {
                return res.status(400).json({ message: 'Сообщение не может быть пустым' });
            }

            const ticket = await Ticket.findById(id);
            if (!ticket) return res.status(404).json({ message: "Тикет не найден" });
            if (ticket.status === 'closed') return res.status(400).json({ message: "Тикет уже закрыт" });

            const isAdmin = req.user.roles.includes('ADMIN');
            if (req.user.id !== ticket.author.toString() && !isAdmin) {
                return res.status(403).json({ message: "Нет доступа" });
            }

            ticket.messages.push({ sender: req.user.id, content, date: new Date() });
            await ticket.save();

            if (isAdmin) {
                await Notification.create({
                    userId: ticket.author,
                    ticketId: ticket._id,
                    message: `Получен ответ в тикете: ${ticket.title}`
                });
            } else {
                const admins = await User.find({ roles: 'ADMIN' });
                const notifications = admins.map(admin => ({
                    userId: admin._id,
                    ticketId: ticket._id,
                    message: `Новое сообщение в тикете: ${ticket.title}`
                }));
                if (notifications.length > 0) await Notification.insertMany(notifications);
            }

            res.json({ data: ticket });
        } catch (e) {
            next(e);
        }
    }

    async getUserData(req, res, next) {
        try {
            const tickets = await Ticket.find({ author: req.user.id }).sort({ date: -1 });
            res.json({ data: tickets });
        } catch (e) {
            next(e);
        }
    }

    async getAllTickets(req, res, next) {
        try {
            const { page = 1, limit = 10, search = '', status = '', searchBy = 'authorUsername' } = req.query;
            
            const allowedFields = ['title', 'authorUsername', 'description'];
            const actualSearchBy = allowedFields.includes(searchBy) ? searchBy : 'authorUsername';

            const maxLimit = Math.min(parseInt(limit) || 10, 100);
            const currentPage = parseInt(page) || 1;
            const skip = (currentPage - 1) * maxLimit;

            const filters = {};
            if (search) {
                const safeSearch = escapeRegex(search);
                filters[actualSearchBy] = { $regex: safeSearch, $options: 'i' };
            }
            if (status) filters.status = status;

            const tickets = await Ticket.find(filters).skip(skip).limit(maxLimit).sort({ date: -1 });
            const total = await Ticket.countDocuments(filters);

            res.json({ data: tickets, total });
        } catch (e) {
            next(e);
        }
    }

    async getTicketData(req, res, next) {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Некорректный ID' });
            }

            const ticket = await Ticket.findById(id);
            if (!ticket) return res.status(404).json({ message: "Тикет не найден" });

            const isAdmin = req.user.roles.includes('ADMIN');
            if (ticket.author.toString() === req.user.id || isAdmin) {
                res.json({ data: ticket, isAdmin });
            } else {
                res.status(403).json({ message: "Нет доступа" });
            }
        } catch (e) {
            next(e);
        }
    }

    async closeTicket(req, res, next) {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Некорректный ID' });
            }

            const ticket = await Ticket.findById(id);
            if (!ticket) return res.status(404).json({ message: "Тикет не найден" });

            const isAdmin = req.user.roles.includes('ADMIN');
            if (ticket.author.toString() !== req.user.id && !isAdmin) {
                return res.status(403).json({ message: "Нет доступа" });
            }

            ticket.status = 'closed';
            await ticket.save();

            if (isAdmin && ticket.author.toString() !== req.user.id) {
                await Notification.create({
                    userId: ticket.author,
                    ticketId: ticket._id,
                    message: `Ваш тикет "${ticket.title}" был закрыт`
                });
            }

            res.json({ data: ticket });
        } catch (e) {
            next(e);
        }
    }

    async openTicket(req, res, next) {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Некорректный ID' });
            }

            const ticket = await Ticket.findById(id);
            if (!ticket) return res.status(404).json({ message: "Тикет не найден" });

            const isAdmin = req.user.roles.includes('ADMIN');
            if (ticket.author.toString() !== req.user.id && !isAdmin) {
                return res.status(403).json({ message: "Нет доступа" });
            }

            const openTicketCount = await Ticket.countDocuments({ author: ticket.author, status: 'open' });
            if (openTicketCount >= 3) {
                return res.status(400).json({ message: 'Лимит открытых тикетов превышен' });
            }

            ticket.status = 'open';
            await ticket.save();
            res.json({ data: ticket });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new TicketController();

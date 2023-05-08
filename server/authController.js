const User = require('./models/User')
const Role = require('./models/Role')
const Ticket = require('./models/Ticket');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')
const { secret } = require("./config")

const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles
  }
  return jwt.sign(payload, secret, { expiresIn: "24h" })
}

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Ошибка при регистрации", errors });
      }

      const { username, email, password } = req.body;
      const candidateUsername = await User.findOne({ username });
      if (candidateUsername) {
        return res.status(400).json({ message: "Пользователь с таким именем уже существует" });
      }

      const candidateEmail = await User.findOne({ email });
      if (candidateEmail) {
        return res.status(400).json({ message: "Email уже зарегистрирован" });
      }

      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: "USER" })
      const user = new User({ username, email, password: hashPassword, roles: [userRole.value] })
      await user.save()
      return res.json({ message: "Пользователь успешно зарегистрирован" })
    } catch (e) {
      console.log(e)
      res.status(400).json({ message: 'Ошибка при регистрации' })
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body
      const user = await User.findOne({ username })
      if (!user) {
        return res.status(400).json({ message: `Пользователь ${username} не найден` })
      }
      const validPassword = bcrypt.compareSync(password, user.password)
      if (!validPassword) {
        return res.status(400).json({ message: `Введен неверный пароль` })
      }
      const token = generateAccessToken(user._id, user.roles)
      return res.json({ token })
    } catch (e) {
      console.log(e)
      res.status(400).json({ message: 'Login error' })
    }
  }

  async getUsers(req, res) {
    try {
      const userRole = new Role()
      const adminRole = new Role({ value: "ADMIN" })
      await userRole.save()
      await adminRole.save()
      const users = await User.find()
      res.json(users)
    } catch (e) {
      console.log(e)
    }
  }

  async check(req, res, next) {
    const token = generateJwt(req.user.id, req.user.role)
    return res.json({ token })
  }

  async getUserInfo(req, res) {
    try {
      const user = await User.findOne({ _id: req.user.id });
      const isAdmin = user.roles.includes('ADMIN');
      if (!user) {
        return res.status(404).json({ message: `Пользователь не найден` });
      }
      res.json({ message: "Информация о пользователе получена", username: user.username, roles: user.roles });
    } catch (e) {
      console.log(e);
      res.status(403).json({ message: "Пользователь не авторизован" });
    }
  }

  async getUserData(req, res) {
    try {
      const userData = await Ticket.find({ author: req.user.id });
      if (!userData) {
        return res.status(404).json({ message: `Данные пользователя не найдены` });
      }
      res.json({ message: "Данные пользователя получены", data: userData });
    } catch (e) {
      console.log(e);
      res.status(403).json({ message: "Пользователь не авторизован" });
    }
  }

  async getAllTickets(req, res) {
    try {
      const user = await User.findOne({ _id: req.user.id });
  
      if (!user) {
        return res.status(404).json({ message: `Пользователь не найден` });
      }
  
      const isAdmin = user.roles.includes('ADMIN');
  
      if (isAdmin) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
  
        const allTickets = await Ticket.find().skip(skip).limit(limit);
        const totalTickets = await Ticket.countDocuments();
  
        res.json({ message: "Все тикеты получены", data: allTickets, total: totalTickets });
      } else {
        res.status(403).json({ message: "Доступ запрещен. Только администраторы могут получить все тикеты" });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
  
  

  async getTicketData(req, res) {
    try {
      const ticketId = req.params.id;
      const ticket = await Ticket.findById(ticketId);
  
      if (!ticket) {
        return res.status(404).json({ message: `Тикет не найден` });
      }
  
      const user = await User.findById(req.user.id);
      const isAdmin = user.roles.includes('ADMIN');
  
      if (ticket.author.toString() === req.user.id || isAdmin) {
        res.json({ message: "Данные тикета получены", data: ticket, isAdmin: isAdmin });
      } else {
        res.status(403).json({ message: "Пользователь не авторизован" });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
  

  async createTicket(req, res) {
    try {
      const { title, description } = req.body;
      const userId = req.user.id;
  
      // Найти количество тикетов, созданных данным пользователем
      const userTicketCount = await Ticket.countDocuments({ author: userId });
  
      // Проверить, превышено ли максимальное количество тикетов (3)
      if (userTicketCount >= 3) {
        return res.status(400).json({ message: 'Вы не можете создать больше 3 тикетов' });
      }
  
      const newTicket = new Ticket({
        title: title,
        author: userId,
        date: new Date(),
        description: description,
        messages: []
      });
  
      await newTicket.save();
      res.status(201).json({ message: 'Тикет успешно создан', data: newTicket });
  
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
  

  async addMessageToTicket(req, res) {
    try {
      const ticketId = req.params.id;
      const { content } = req.body;
      const userId = req.user.id;
  
      const ticket = await Ticket.findById(ticketId);

      
  
      if (!ticket) {
        return res.status(404).json({ message: `Тикет не найден` });
      }
  
      if (ticket.status === 'closed') {
        return res.status(400).json({ message: 'Нельзя добавить сообщение к закрытому тикету' });
      }

      const isAdmin = req.user.roles.includes('ADMIN');
      if (userId !== ticket.author.toString() && !isAdmin) {
        return res.status(403).json({ message: 'У вас нет прав на добавление сообщения к этому тикету' });
      }
  
      const newMessage = {
        sender: userId,
        content,
        date: new Date()
      };
  
      // Добавляем сообщение к тикету и сохраняем
      ticket.messages.push(newMessage);
      await ticket.save();
  
      res.json({ message: "Сообщение добавлено", data: ticket });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
  

  async closeTicket(req, res) {
    try {
      const ticketId = req.params.id;
      const ticket = await Ticket.findById(ticketId);
  
      if (!ticket) {
        return res.status(404).json({ message: `Тикет не найден` });
      }
  
      const user = await User.findById(req.user.id);
      const isAdmin = user.roles.includes('ADMIN');
  
      if (isAdmin) {
        ticket.status = 'closed';
        await ticket.save();
        res.json({ message: "Тикет закрыт", data: ticket });
      } else {
        res.status(403).json({ message: "Пользователь не авторизован" });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
  

}

module.exports = new authController()

const User = require('./models/User')
const Role = require('./models/Role')
const Ticket = require('./models/Ticket');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
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
      const user = new User({ username, email, password: hashPassword, roles: [userRole.value], isVerified: false })

      // Генерация токена подтверждения
      const emailToken = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'ticketssystem261@gmail.com',
          pass: 'qfgklrfdzhxrulkd'
        }
      });

      let mailOptions = {
        from: '"TicketsSystem" <your-email@example.com>', // sender address
        to: email, // list of receivers
        subject: "Email Confirmation", // Subject line
        text: `Hello, ${username}, please confirm your email by clicking on the following link: \n\n 
        http://localhost:3000/confirmation/${emailToken} \n\n If you did not request this, please ignore this email.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
      });

      await user.save()
      return res.json({ message: "Пожалуйста, проверьте свою почту, чтобы подтвердить регистрацию" })
    } catch (e) {
      console.log(e)
      res.status(400).json({ message: 'Ошибка при регистрации' })
    }
  }


  async recoverPassword(req, res) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Генерация токена сброса пароля
        const resetToken = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });

        // Обновление пользователя с новым токеном сброса пароля
        user.resetToken = resetToken;
        await user.save();

        // Отправка письма со ссылкой на сброс пароля
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ticketssystem261@gmail.com',
              pass: 'qfgklrfdzhxrulkd'
            }
        });

        let mailOptions = {
            from: '"TicketsSystem" <your-email@example.com>', // sender address
            to: email, // list of receivers
            subject: "Password reset", // Subject line
            text: `You have requested a password reset. Please follow the link below to reset your password: \n\n 
            http://localhost:3000/resetpassword/${resetToken} \n\n If you did not request this, please ignore this email.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
        });

        return res.json({ message: 'Instructions have been sent to the email' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Error' });
    }
}


  async login(req, res) {
    try {
      const { username, password } = req.body
      const user = await User.findOne({ username })
      if (!user) {
        return res.status(400).json({ message: `Введен неверный логин или пароль` })
      }

      if (!user.isVerified) {
        return res.status(400).json({ message: `Пожалуйста, подтвердите свой адрес электронной почты` })
      }

      const validPassword = bcrypt.compareSync(password, user.password)
      if (!validPassword) {
        return res.status(400).json({ message: `Введен неверный логин или пароль` })
      }
      const token = generateAccessToken(user._id, user.roles)
      return res.json({ token })
    } catch (e) {
      console.log(e)
      res.status(400).json({ message: 'Login error' })
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
      res.json({
        message: "Информация о пользователе получена",
        username: user.username,
        roles: user.roles,
        notifications: user.notifications,
      });
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
      const searchBy = req.query.searchBy || "authorUsername";

      if (!user) {
        return res.status(404).json({ message: `Пользователь не найден` });
      }

      const isAdmin = user.roles.includes('ADMIN');

      if (isAdmin) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const status = req.query.status || '';
        const startDate = req.query.startDate ? new Date(req.query.startDate) : '';
        const endDate = req.query.endDate ? new Date(req.query.endDate) : '';

        const searchOption = searchBy === "title" ? { title: { $regex: search, $options: 'i' } } : { authorUsername: { $regex: search, $options: 'i' } };

        // Создайте объект для хранения фильтров
        const filters = {};

        // Добавьте фильтры поиска, статуса, даты начала и даты окончания
        if (search) {
          filters[searchBy] = searchOption[searchBy];
        }

        if (status) {
          filters.status = status;
        }

        if (startDate && endDate) {
          filters.date = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
          filters.date = { $gte: startDate };
        } else if (endDate) {
          filters.date = { $lte: endDate };
        }

        const allTickets = await Ticket.find(filters).skip(skip).limit(limit);
        const totalTickets = await Ticket.countDocuments(filters);

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


  createTicket = async (req, res) => {
    try {
      const { title, description } = req.body;
      const userId = req.user.id;

      // Найти пользователя по userId
      const user = await User.findById(userId);

      // Найти количество тикетов, созданных данным пользователем
      const userTicketCount = await Ticket.countDocuments({ author: userId });

      // Проверить, превышено ли максимальное количество тикетов (3)
      if (userTicketCount >= 3) {
        return res.status(400).json({ message: 'Вы не можете создать больше 3 открытых тикетов' });
      }

      const newTicket = new Ticket({
        title: title,
        author: userId,
        authorUsername: user.username, // добавить username автора
        date: new Date(),
        description: description,
        messages: []
      });

      await newTicket.save();

      const admins = await User.find({ roles: 'ADMIN' });
      for (const admin of admins) {
        await this.addAdminNotificationToUser(
          admin._id,
          newTicket._id,
          `Создан новый тикет "${newTicket.title}" от пользователя ${user.username}`
        );
      }

      res.status(201).json({ message: 'Тикет успешно создан', data: newTicket });

    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }



  addMessageToTicket = async (req, res) => {
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

      if (isAdmin) {
        await this.addAdminNotificationToUser(
          ticket.author,
          ticket._id,
          `Администратор добавил сообщение к вашему тикету`
        );
      }

      // Добавляем сообщение к тикету и сохраняем
      ticket.messages.push(newMessage);
      await ticket.save();

      if (!isAdmin) {
        const messageSenders = ticket.messages
          .filter(message => message.sender.toString() !== userId && message.sender.toString() !== ticket.author.toString())
          .map(message => message.sender.toString());
        const uniqueMessageSenders = [...new Set(messageSenders)];
        for (const sender of uniqueMessageSenders) {
          await this.addAdminNotificationToUser(
            sender,
            ticket._id,
            `Пользователь ${ticket.authorUsername} добавил сообщение к тикету`
          );
        }
      }

      res.json({ message: "Сообщение добавлено", data: ticket });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async addAdminNotificationToUser(userId, ticketId, message) {
    try {
      const notification = {
        ticketId,
        type: 'INFO',
        message,
        isRead: false,
        date: new Date()
      };

      await User.updateOne(
        { _id: userId },
        { $push: { notifications: notification } }
      );
    } catch (e) {
      console.log(e);
    }
  }



  closeTicket = async (req, res) => {
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

        await this.addAdminNotificationToUser(
          ticket.author,
          ticket._id,
          `Администратор закрыл ваш тикет`
        );

        res.json({ message: "Тикет закрыт", data: ticket });
      } else {
        res.status(403).json({ message: "Пользователь не авторизован" });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }


  openTicket = async (req, res) => {
    try {
      const ticketId = req.params.id;
      const ticket = await Ticket.findById(ticketId);
      const userId = req.user.id;
      const isAdmin = req.user.roles.includes('ADMIN');

      if (!ticket) {
        return res.status(404).json({ message: `Тикет не найден` });
      }

      const user = await User.findById(req.user.id);

      if (ticket.author.toString() === req.user.id) { // проверяем, что текущий пользователь является автором тикета
        ticket.status = 'open';
        await ticket.save();

        if (!isAdmin) {
          const messageSenders = ticket.messages
            .filter(message => message.sender.toString() !== userId && message.sender.toString() !== ticket.author.toString())
            .map(message => message.sender.toString());
          const uniqueMessageSenders = [...new Set(messageSenders)];
          for (const sender of uniqueMessageSenders) {
            await this.addAdminNotificationToUser(
              sender,
              ticket._id,
              `Пользователь ${ticket.authorUsername} заново открыл тикет`
            );
          }
        }


        res.json({ message: "Тикет открыт", data: ticket });
      } else {
        res.status(403).json({ message: "Вы не можете открыть этот тикет: вы не являетесь автором" });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }



  async deleteNotification(req, res) {
    try {
      const user = await User.findOne({ _id: req.user.id });

      if (!user) {
        return res.status(404).json({ message: `Пользователь не найден` });
      }

      user.notifications = user.notifications.filter(
        (notification) => notification._id.toString() !== req.params.id
      );

      await user.save();

      res.json({ message: "Уведомление удалено" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка при удалении уведомления" });
    }
  }


}

module.exports = new authController()

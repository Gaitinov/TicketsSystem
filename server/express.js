const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const jwt = require('jsonwebtoken');
const { secret } = require("./config")
const User = require('./models/User')

const app = express();
const port = process.env.port || 3000;

app.use(express.static(path.join(__dirname, '..', 'client', 'public')));
app.use(express.json());
app.use('/auth', authRouter);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'client', 'views'));

async function connection() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/myDatabase', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`it works!`);

    app.get('/', (req, res) => {
      const page = 'index';
      res.render(page);
    });

    app.get('/:page', function (req, res, next) {
      const page = req.params.page;
      res.render(
        page,
        function (err, html) {
          if (err) {
            next(err);
          } else {
            res.send(html);
          }
        }
      );
    });

    app.get('/page/:id', function (req, res, next) {
      const id = req.params.id;
      res.render(
        'page', // имя шаблона страницы
        { id: id }, // объект данных для передачи в шаблон
        function (err, html) {
          if (err) {
            next(err);
          } else {
            res.send(html);
          }
        }
      );
    });

    app.use(function (err, req, res, next) {
      if (err) {
        console.error(err);
        res.status(404).send('Page not Found');
      } else {
        next();
      }
    });
  } catch (error) {
    console.log('Error!');
  }

  app.get('/confirmation/:token', async (req, res) => {
    try {
      const { token } = req.params;
  
      // верификация токена
      const payload = jwt.verify(token, secret);
  
      // поиск пользователя по id из payload'а
      const user = await User.findById(payload.userId);
  
      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' });
      }
  
      // подтверждение пользователя
      user.isVerified = true;
      await user.save();
  
      return res.json({ message: 'Электронная почта успешно подтверждена' });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: 'Ошибка при подтверждении электронной почты' });
    }
  });

}

connection();

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

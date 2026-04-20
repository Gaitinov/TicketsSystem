require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { mongoUri, port } = require("./config");
const authController = require('./controllers/authController');


const authRouter = require('./routes/authRouter');
const ticketRouter = require('./routes/ticketRouter');
const notificationRouter = require('./routes/notificationRouter');

const app = express();


app.use(express.static(path.join(__dirname, '..', 'client', 'public')));
app.use(express.json());


app.use('/auth', authRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/notifications', notificationRouter);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'client', 'views'));


app.use('/page/img', express.static(path.join(__dirname, '..', 'client', 'public', 'img')));

app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('login'));
app.get('/registration', (req, res) => res.render('registration'));
app.get('/main', (req, res) => res.render('main'));
app.get('/createticket', (req, res) => res.render('createticket'));
app.get('/viewtickets', (req, res) => res.render('viewtickets'));

app.get('/page/:id', function (req, res, next) {
  const id = req.params.id;
  res.render('page', { id }, (err, html) => {
    if (err) return next(err);
    res.send(html);
  });
});

app.get('/confirmation/:token', authController.confirmEmail);

app.get('/resetpassword/:token', (req, res) => res.render('resetpassword', { token: req.params.token }));


app.use((err, req, res, next) => {
  console.error('Global Error:', err.message);
  res.status(err.status || 500).send(err.message || 'Internal Server Error');
});


async function start() {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully!');

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

start();

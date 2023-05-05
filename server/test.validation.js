const mongoose = require('mongoose');
const User = require('./userModel'); // Подключаем вашу модель пользователя

async function testValidation() {
  await mongoose.connect("mongodb://127.0.0.1:27017/myDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Создаем нового пользователя с неверными данными
  const invalidUser = new User({
    username: '', // неверное имя пользователя
    email: 'invalid email', // неверный email
    password: '', // неверный пароль
  });
  
  try {
    await invalidUser.save();
    console.log('This user should not have been saved!');
  } catch (err) {
    console.error(err.message); // Выводим ошибки валидации
  }

  mongoose.disconnect(); // Отключаемся от базы данных
}

testValidation(); // Запускаем тестовую функцию

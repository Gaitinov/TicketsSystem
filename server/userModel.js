const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, 'Please enter an email address'],
    unique: true,
    match: [/^[^@]+@[^@]+\.[^@]+$/, 'Please enter a valid email address']
  },
});

userSchema.statics.findByCredentials = async function (username, password) {
  const user = await this.findOne({ username });
  if (!user) {
    throw new Error('Unable to login');
  }
  const isMatch = password === user.password;
  if (!isMatch) {
    throw new Error('Unable to login');
  }
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

const { Schema, model } = require('mongoose')

const TicketSchema = new Schema({
  title: String,
  author: String,
  date: String,
  answers: Number,
});

module.exports = model('Ticket', TicketSchema);
const { Schema, model } = require('mongoose')

const TicketSchema = new Schema({
  title: String,
  author: String,
  date: Date,
  description: String,
});

module.exports = model('Ticket', TicketSchema);
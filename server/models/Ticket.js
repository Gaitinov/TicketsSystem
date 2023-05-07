const { Schema, model } = require('mongoose');

const TicketSchema = new Schema({
  title: String,
  author: String,
  date: Date,
  description: String,
  messages: [
    {
      sender: String,
      content: String,
      date: Date,
    },
  ],
});

module.exports = model('Ticket', TicketSchema);

const { Schema, model } = require('mongoose');

const TicketSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  messages: [
    {
      sender: String,
      content: String,
      date: Date,
    },
  ],
});

module.exports = model('Ticket', TicketSchema);

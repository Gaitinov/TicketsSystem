const { Schema, model } = require('mongoose');

const TicketSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  description: { type: String, required: true },
  messages: [
    {
      sender: { type: String, required: true },
      content: { type: String, required: true },
      date: { type: Date, default: Date.now, required: true }, 
    },
  ],
});

module.exports = model('Ticket', TicketSchema);

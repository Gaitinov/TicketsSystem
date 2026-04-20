# TicketsSystem

A simple ticket management system built with Node.js.

## Features

- Registration and Authorization (JWT).
- Email confirmation and password reset.
- Ticket creation (limit: 3 open tickets per user).
- Notification system for users and admins.
- Ticket list with pagination and search.

## Tech Stack

- Node.js, Express.js.
- MongoDB (Mongoose).
- EJS, Bootstrap 4.
- Nodemailer.

## Installation

1. Install dependencies (in the `server` folder):
   ```bash
   npm install
   ```

2. Configuration:
   Create a `.env` file in the `server` folder:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/tickets
   JWT_SECRET=secret_key
   CLIENT_URL=http://localhost:3000
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASS=your_app_password
   ```

3. Run the project:
   ```bash
   npm start
   ```
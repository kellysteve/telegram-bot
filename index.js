const express = require('express');

const FormData = require('form-data');

const { exec } = require("child_process");


const yts = require('yt-search');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic HTML response for health check
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Bot Status</title>
      </head>
      <body style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
        <h1 style="color: green;">✅ Bot Connected to Telegram</h1>
        <p>Your bot is up and running!</p>
      </body>
    </html>
  `);
});

// Start the HTTP server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Telegram Bot Connected');
});


//
const TelegramBot = 
require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your bot token
const bot = new TelegramBot('YOUR_TELEGRAM_BOT_TOKEN', { polling: true });

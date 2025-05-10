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

// /play command
bot.onText(/\/play(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const inputText = match[1];

    if (!inputText) {
        return bot.sendMessage(chatId, "❌ Please provide the song name.\nExample: `/play Faded by Alan Walker`");
    }

    try {
        // Notify user that the bot is searching
        await bot.sendMessage(chatId, "🔍 Searching for your song...");

        // Perform a YouTube search
        const search = await yts(inputText);
        const video = search.all[0];

        if (!video) {
            return bot.sendMessage(chatId, "❌ Sorry, I couldn't find the song. Try another keyword.");
        }

        // Fetch the song download link using the new API
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`;
        const response = await axios.get(apiUrl);
        const { success, result } = response.data;

        if (success && result) {
            const { title, thumbnail, download_url } = result;
            const filename = `./${video.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`;

            // Send song details with thumbnail
            await bot.sendPhoto(chatId, thumbnail, {
                caption: `🎶 *Music Player* 🎶\n\n` +
                    `🎵 *Title:* ${video.title}\n` +
                    `🔗 [Watch on YouTube](${video.url})\n\n*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀᴠɪᴅ ᴄʏʀɪʟ ᴛᴇᴄʜ*`,
                parse_mode: "Markdown",
            });

            // Download the audio file
            const writer = fs.createWriteStream(filename);
            const { data } = await axios({
                url: download_url,
                method: "GET",
                responseType: "stream",
            });

            data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            // Send the locally saved audio file
            await bot.sendAudio(chatId, filename, {
                caption: `🎧 *Here's your song:*\n🎵 *Title:* ${video.title}\n\n*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀᴠɪᴅ ᴄʏʀɪʟ ᴛᴇᴄʜ*`,
                parse_mode: "Markdown",
            });

            // Delete the file after sending
            fs.unlink(filename, (err) => {
                if (err) console.error("Error deleting file:", err);
            });
        } else {
            bot.sendMessage(chatId, "❌ Unable to download the song. Please try again later.");
        }
    } catch (error) {
        console.error("Error during /play command:", error);
        bot.sendMessage(chatId, "❌ An error occurred while processing your request. Please try again later.");
    }
});

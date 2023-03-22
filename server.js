// Import required libraries and modules
require('dotenv').config();
const line = require('@line/bot-sdk');
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");

// Set up configuration for LINE bot
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// Create a new instance of the OpenAI API
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

// Create a new instance of the LINE bot client
const client = new line.Client(config);

// Create a new Express application
const app = express();

// Define a route for handling incoming webhook events
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    // Extract the events array from the request body and use Promise.all to handle multiple events
    const events = req.body.events;
    const result = await Promise.all(events.map(handleEvent));

    // Return the result as a JSON response
    res.json(result);
  } catch (err) {
    // Handle errors with a 500 HTTP response
    console.error(err);
    res.status(500).end();
  }
});

// Define a function for handling incoming LINE bot messages
async function handleEvent(event) {
  // If the event type is not 'message' or the message type is not 'text', return null
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  // Use the OpenAI API to generate a response based on the text message
  const completions = await openai.createCompletion({
    prompt: event.message.text,
    model: "text-davinci-003",
    max_tokens: 1000,
  });

  // Extract the response message from the OpenAI API result
  const message = completions.data.choices[0].text.trim();

  // Send the response message back to the user using the LINE bot client
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: message,
  });
}

// Extract the port value to a variable
const port = process.env.PORT || 3000;

// Start the Express application and listen on the specified port
app.listen(port, () => {
  console.log(`Linebot is running on port ${port}`);
});

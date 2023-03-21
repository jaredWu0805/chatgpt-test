require('dotenv').config();
const line = require('@line/bot-sdk');
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent (event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return openai.createCompletion({
    prompt: event.message.text,
    model: "text-davinci-003",
    max_tokens: 1000
  }).then((completions) => {
    const message = completions.data.choices[0].text.trim();
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: message
    });
  });
}

app.listen(3000);
console.log('Linebot is running on 3000 port');
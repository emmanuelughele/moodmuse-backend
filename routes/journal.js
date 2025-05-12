const express = require('express');
const router = express.Router();
const { getLLMFeedbackStream } = require('../services/llmFeedbackService');

router.post('/analyze', async (req, res) => {
  const { entry } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await getLLMFeedbackStream(entry, (chunk) => {
      res.write(`data: ${chunk}\n\n`);
    });
    res.end();
  } catch (err) {
    console.error(err);
    res.write(`data: Something went wrong. 😔\n\n`);
    res.end();
  }
});

module.exports = router;

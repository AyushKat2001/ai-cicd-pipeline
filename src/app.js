const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/greet', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name query param required' });
  res.status(200).json({ message: `Hello, ${name}!` });
});

app.post('/api/echo', (req, res) => {
  res.status(200).json({ received: req.body });
});

module.exports = app;
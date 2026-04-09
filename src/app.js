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

app.get('/api/users', (req, res) => {
  // TODO: connect to database
  const users = [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' }
  ];
  res.status(200).json({ users });
});

module.exports = app;
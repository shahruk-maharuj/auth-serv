import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to the Auth Service!');
});

export default app;

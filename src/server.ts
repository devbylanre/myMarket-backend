import express from 'express';

const app = express();

app.listen(3000, 'localhost', () =>
  console.log('Welcome to port 3000 John Doe')
);

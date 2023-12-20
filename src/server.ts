import express from 'express';
import { config } from './config';
import mongoose from 'mongoose';
import userRouter from './routes/user.route';
import path from 'path';
import cors from 'cors';

const app = express();

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// serve ejs files
app.use(express.static(path.join(__dirname, 'views')));

app.use((req, res, next) => {
  console.log(req.path, req.method);

  next();
});

app.get('/', (req, res) => {
  res.render('welcome.ejs', {});
});

app.use(express.json());
app.use('/api/v1/user', userRouter);

mongoose
  .connect(config.mongoDBDriver + 'myMarket')
  .then(() => {
    app.listen(config.port, 'localhost', () =>
      console.log(`Welcome to port ${config.port} John Doe`)
    );
  })
  .catch((err) => console.log(err));

import express from 'express';
import { config } from './config';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';

// routers
import productRouter from './routes/product.route';
import userRouter from './routes/user.route';

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
  res.render('welcome.ejs', {
    subject: 'Welcome to Port 5000',
    username: 'John doe',
    verificationUrl: 'http://localhost:5000',
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRouter);
app.use('/product', productRouter);

mongoose
  .connect(config.mongoDBDriver)
  .then(() => {
    app.listen(config.port, 'localhost', () =>
      console.log(`Welcome to port ${config.port} John Doe`)
    );
  })
  .catch((err) => console.log(err));

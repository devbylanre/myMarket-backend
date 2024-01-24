import express from 'express';
import config from './configs/config';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';

// routers
import productRouter from './routes/product.route';
import userRouter from './routes/user.route';
import otpRouter from './routes/otp.route';
import billingRouter from './routes/biling.route';

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

app.get('/', (_, res) => {
  res.render('welcome.ejs', {
    subject: 'Welcome to Port 5000',
    username: 'John doe',
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routers
app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/otps', otpRouter);
app.use('/billings', billingRouter);

mongoose
  .connect('mongodb://127.0.0.1:27017/mymarket')
  .then(() => {
    app.listen(config.port, 'localhost', () =>
      console.log(`Welcome to port ${config.port} John Doe`)
    );
  })
  .catch((err) => console.log(err));

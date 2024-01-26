import express from 'express';
import config from './configs/config';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';

// routers
import productRouter from './routes/product.route';
import userRouter from './routes/user.route';
import otpRouter from './routes/otp.route';
import billingRouter from './routes/billing.route';
import storeRouter from './routes/store.route';
import mobileRouter from './routes/mobile.route';
import pinRouter from './routes/pin.route';
import communityRouter from './routes/community.route';
import reviewRouter from './routes/review.route';
import tokenRouter from './routes/token.route';

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
app.use('/products', productRouter);
app.use('/otps', otpRouter);
app.use('/billings', billingRouter);
app.use('/stores', storeRouter);
app.use('/mobiles', mobileRouter);
app.use('/communities', communityRouter);
app.use('/pins', pinRouter);
app.use('/reviews', reviewRouter);
app.use('/tokens', tokenRouter);

mongoose
  .connect('mongodb://127.0.0.1:27017/mymarket')
  .then(() => {
    app.listen(config.port, 'localhost', () =>
      console.log(`Welcome to port ${config.port} John Doe`)
    );
  })
  .catch((err) => console.log(err));

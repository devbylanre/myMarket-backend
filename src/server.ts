import express from 'express';
import config from './configs/config';
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
import { connectToDB } from './configs/db';
import authRouter from './routes/auth.route';

const app = express();

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// serve ejs files
app.use(express.static(path.join(__dirname, 'views')));

app.use((req, _, next) => {
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
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/otps', otpRouter);
app.use('/billings', billingRouter);
app.use('/stores', storeRouter);
app.use('/mobiles', mobileRouter);
app.use('/communities', communityRouter);
app.use('/pins', pinRouter);
app.use('/reviews', reviewRouter);
app.use('/tokens', tokenRouter);

// Connect to database
connectToDB('mongodb://127.0.0.1:27017/mymarket', () => {
  app.listen(config.port, () =>
    console.log(`PORT: Working on port ${config.port}`)
  );
});

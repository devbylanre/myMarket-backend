import express from 'express';
import { config } from './config';
import mongoose from 'mongoose';
import userRouter from './routes/user.route';

const app = express();

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

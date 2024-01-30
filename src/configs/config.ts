import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT as string,
  mongoDB: process.env.MONGODB_DRIVER as string,
  accessToken: process.env.ACCESS_TOKEN_SECRET as string,
  refreshToken: process.env.REFRESH_TOKEN_SECRET as string,
  client: process.env.CLIENT as string,
};

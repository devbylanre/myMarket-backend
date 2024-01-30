import dotenv from 'dotenv';
dotenv.config();

export default {
  port: parseInt(process.env.PORT as string, 10),
  mongoDB: process.env.MONGODB_DRIVER as string,
  accessToken: process.env.ACCESS_TOKEN_SECRET as string,
  refreshToken: process.env.ACCESS_TOKEN_SECRET as string,
  client: process.env.CLIENT as string,
};

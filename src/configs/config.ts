import dotenv from 'dotenv';
dotenv.config();

export default {
  port: parseInt(process.env.PORT as string, 10),
  mongoDB: process.env.MONGODB_DRIVER as string,
  secretKey: process.env.SECRET_KEY as string,
  client: process.env.CLIENT as string,
};

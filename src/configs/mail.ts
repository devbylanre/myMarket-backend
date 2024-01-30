import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  service: 'gmail',
  port: 587,
  auth: {
    user: process.env.GMAIL_USER as string,
    pass: process.env.GMAIL_PASSWORD as string,
  },
});

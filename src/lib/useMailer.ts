import nodemailer from 'nodemailer';
import config from '../config';
import ejs, { Data } from 'ejs';

export type Mailer<T extends unknown> = {
  recipient: string;
  subject: string;
  path: string;
  data: T;
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  service: 'gmail',
  port: 587,
  auth: {
    user: config.gmail.user,
    pass: config.gmail.password,
  },
});

export const useMailer = () => {
  const mail = async <T extends unknown>(options: Mailer<T>) => {
    const { recipient, subject, path, data } = options;

    const template = await ejs.renderFile(path, data as Data);

    const mailOptions: nodemailer.SendMailOptions = {
      from: 'noreply@gmymarket.com',
      to: recipient,
      subject: subject,
      html: template,
    };

    try {
      const mail = await transporter.sendMail(mailOptions);
      return mail;
    } catch (error) {
      throw new Error('Unable to send mail ' + (error as Error).message);
    }
  };

  return { mail };
};

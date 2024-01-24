import nodemailer from 'nodemailer';
import mailConfig from '../configs//mail';
import ejs, { Data } from 'ejs';
import path from 'path';

export type MailOptions<T extends unknown> = {
  recipient: string;
  subject: string;
  file: string;
  data: T;
};

// create a nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  service: 'gmail',
  port: 587,
  auth: {
    user: mailConfig.user,
    pass: mailConfig.password,
  },
});

// hook for sending email
export const useMailer = () => {
  const mail = async <T extends unknown>(options: MailOptions<T>) => {
    const { recipient, subject, file, data } = options;
    const filePath = path.join(__dirname, '..', 'views', file);

    const template = await ejs.renderFile(filePath, data as Data);

    // construct the mail object
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

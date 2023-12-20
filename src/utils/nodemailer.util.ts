import nodemailer from 'nodemailer';
import { config } from '../config';
import ejs from 'ejs';

export interface MailSchema {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  service: 'gmail',
  port: 587,
  auth: {
    user: config.gmail_user,
    pass: config.gmail_password,
  },
});

export const mailer = {
  send: async function (options: MailSchema) {
    const { to, subject, template, data } = options;
    const content: string = await ejs.renderFile(template, data);

    const mailOptions: nodemailer.SendMailOptions = {
      from: 'noreply@myMailer.com',
      to: to,
      subject: subject,
      html: content,
    };

    try {
      const mail = await transporter.sendMail(mailOptions);
      return mail;
    } catch (err) {
      console.error('Error sending mail', err);
    }
  },
};

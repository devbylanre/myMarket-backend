import nodemailer from 'nodemailer';
import ejs, { Data } from 'ejs';
import path from 'path';
import { transporter } from '../configs/mail';

export type MailOptions<T extends unknown> = {
  recipient: string;
  subject: string;
  file: string;
  data: T;
};

// hook for sending email
export const useMailer = () => {
  const sendMail = async <T>(options: MailOptions<T>) => {
    const { recipient, subject, file, data } = options;
    const filePath = path.join(__dirname, '..', 'views', file);

    // Render ejs file
    const template = await ejs.renderFile(filePath, data as Data);

    // construct the mail object
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'noreply@gmymarket.com',
      to: recipient,
      subject: subject,
      html: template,
    };

    try {
      // Transport or send mail
      const mail = await transporter.sendMail(mailOptions);
      return mail;
    } catch (error) {
      throw new Error(`Failed to send mail: ${(error as Error).message}`);
    }
  };

  return { sendMail };
};

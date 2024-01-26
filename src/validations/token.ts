import { useValidate } from '../lib/useValidate';

const { isString, isEmail } = useValidate();

const Rules = {
  confirm: [isString('token', 'Token')],
  resend: [isEmail('email', 'Email')],
};

export default Rules;

import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';

const { secretKey } = config;

export const useToken = () => {
  const sign = (payload: string | object, expiresIn: string | number) => {
    const token = jwt.sign(payload, secretKey, { expiresIn: expiresIn });
    return token;
  };

  const decode = (token: string) => {
    const result = jwt.decode(token);
    return result;
  };

  const verify = (token: string) => {
    try {
      const payload = jwt.verify(token, secretKey) as JwtPayload;

      const isExpired = Date.now() > payload.exp! * 1000;

      if (isExpired) {
        throw new Error('Token has expired');
      }

      return payload;
    } catch (error) {
      throw new Error('Unable to verify token');
    }
  };

  return { sign, decode, verify };
};

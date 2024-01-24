import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../configs/config';

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

  const expire = (token: string) => {
    const result = decode(token) as JwtPayload;
    return result.exp;
  };

  const isExpired = (expire: number) => {
    const check = Date.now() > expire * 1000;
    return check;
  };

  const verify = (token: string) => {
    try {
      const payload = jwt.verify(token, secretKey) as JwtPayload;
      const check = isExpired(payload.exp!);

      if (check) {
        throw new Error('Token has expired');
      }

      return payload;
    } catch (error) {
      throw new Error('Unable to verify token');
    }
  };

  return { sign, decode, expire, isExpired, verify };
};

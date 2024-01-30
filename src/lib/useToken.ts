import jwt, { JwtPayload } from 'jsonwebtoken';

export const useToken = () => {
  const generateToken = <T extends {}>(payload: T, secret: string) => {
    const token = jwt.sign(payload, secret, { expiresIn: 60 });
    return token;
  };

  const decodeToken = (token: string) => {
    const result = jwt.decode(token);
    return result;
  };

  const getExp = (token: string) => {
    const result = decodeToken(token) as JwtPayload;
    return result.exp;
  };

  const hasTokenExpired = (expire: number) => {
    const check = Date.now() > expire * 1000;
    return check;
  };

  const verifyToken = (token: string, secret: string) => {
    try {
      const payload = jwt.verify(token, secret);
      return payload;
    } catch (error) {
      throw new Error(`Unable to verify token: ${(error as Error).message}`);
    }
  };

  return { generateToken, decodeToken, getExp, hasTokenExpired, verifyToken };
};

import bcrypt from 'bcrypt';

export const usePassword = () => {
  const encrypt = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  };

  const decode = (password: string, encrypted: string) => {
    const result = bcrypt.compareSync(password, encrypted);
  };

  return { encrypt, decode };
};

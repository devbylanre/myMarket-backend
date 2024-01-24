export const useOTP = () => {
  const generate = (length: number) => {
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 10);
      result += randomNumber;
    }

    return result;
  };

  return { generate };
};

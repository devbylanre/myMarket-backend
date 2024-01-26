import { Response } from 'express';

const ERROR = 'ERROR' as const;
const SUCCESS = 'SUCCESS' as const;

type ResponseType<S extends typeof ERROR | typeof SUCCESS> = { type: S };

type ResponseProps<T extends unknown> =
  | (ResponseType<'ERROR'> & { code: number; message: string })
  | (ResponseType<'SUCCESS'> & {
      data: T;
    } & { code: number; message: string; data: T });

export const useResponse = (res: Response) => {
  const response = <T>(props: ResponseProps<T>) => {
    const { type, code, message } = props;

    //Error response type
    if (props.type === 'ERROR') {
      return res.status(code).json({
        code: code,
        status: type.toLowerCase(),
        message: message,
      });
    }

    // Success response type
    if (props.type === 'SUCCESS') {
      return res.status(code).json({
        code: code,
        status: type.toLowerCase(),
        message: message,
        data: props.data,
      });
    }
  };

  return { response };
};

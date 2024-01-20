import { Response } from 'express';

const ERROR = 'ERROR' as const; // error response type
const SUCCESS = 'SUCCESS' as const; // success response type

// response type
type ResponseType<S extends typeof ERROR | typeof SUCCESS> = { type: S };

// other response props
type Other = {
  code: number;
  message: string;
};

/*
 response props with a typescript type guard to determine the response type, adds an error property if ResponseType is ERROR and data property if ResponseType is SUCCESS
*/
type ResponseProps<T extends unknown> =
  | (ResponseType<'ERROR'> & {
      error: T;
    } & Other)
  | (ResponseType<'SUCCESS'> & {
      data: T;
    } & Other);

// hook for handling route response
export const useResponse = (res: Response) => {
  const response = <T>(props: ResponseProps<T>) => {
    const { code, message } = props;

    // sends response json if response is not successful
    if (props.type === 'ERROR') {
      return res.status(props.code).json({
        code: code,
        message: message,
        error: props.error,
      });
    }

    // send response json if response is successful
    if (props.type === 'SUCCESS') {
      return res.status(props.code).json({
        code: code,
        message: message,
        data: props.data,
      });
    }
  };

  return { response };
};

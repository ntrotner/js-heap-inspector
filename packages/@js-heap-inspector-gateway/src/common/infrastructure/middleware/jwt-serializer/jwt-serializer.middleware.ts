import {
  NextFunction,
} from 'express';

export function JwtSerializerMiddleware(request: Request, res: Response, next: NextFunction) {
  // Console.log(req)
  next();
}

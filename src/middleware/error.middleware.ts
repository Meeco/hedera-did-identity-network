import { NextFunction, Request, Response } from "express";
import { ValidateError } from "tsoa";

export const errorHanlder = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);

    res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
    return;
  }

  next();
};

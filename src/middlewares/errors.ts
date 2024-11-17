import { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/root";

export const errorMiddleware = (error: HttpException, _req: Request, res: Response, _next: NextFunction) => {
    res.status(error.statusCode || 500).json({
        message: error.message || 'Internal Server Error',
        errorCode: error.errorCode || 'INTERNAL_ERROR',
        errors: error.errors || []
    });
};
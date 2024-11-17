import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    username: string;
    iat: number;
    exp: number;
  }

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access denied, no token provided"});           
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as TokenPayload;
        req.body.user = decoded;
        return next();
    } catch (err) {
        return res.status(400).json({message: "Invalid token"})
    }
}
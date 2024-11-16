import { Request, Response } from "express";
import jwt from "jsonwebtoken";

interface LoginRequestBody {
  username: string;
  password: string;
}

export const Login = (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password") {
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );
    return res.json({ message: "Login successful", token });
  }
  return res.status(401).json({ message: "Invalid credentials" });
};

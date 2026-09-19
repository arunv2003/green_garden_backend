import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export interface JwtPayload {
  userId: number;
  email: string;
  role: "USER" | "SECRETARY" | "ACCOUNTANT";
  name: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};

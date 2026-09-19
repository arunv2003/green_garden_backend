import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl: process.env.DATABASE_URL || "mysql://root:root@localhost:3306/green_garden",
  jwtSecret: process.env.JWT_SECRET || "greengarden_secret_key_jwt_2026_super_secure",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  billingMode: (process.env.BILLING_MODE || "DAILY_PRORATED") as "FULL_MONTH" | "DAILY_PRORATED",
};

import dotenv from "dotenv";

dotenv.config();

const envConfig = Object.freeze({
  PORT: process.env.PORT || 9000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000", "http://localhost:5173"],
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
  REDIS_URL: process.env.REDIS_URL || undefined,
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || "no-reply@homely.com",
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || "Homely Support",
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  AWS_REGION: process.env.AWS_REGION || "ap-south-1",
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
});

export default envConfig;

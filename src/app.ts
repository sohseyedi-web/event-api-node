import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from '@/config/db';
import allRoutes from '@/core/routes/router';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));
app.use(cors({ credentials: true, origin: process.env.ALLOW_CORS_ORIGIN }));

app.use('/api/v1', allRoutes);
connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server Started on port ${process.env.PORT}`);
});

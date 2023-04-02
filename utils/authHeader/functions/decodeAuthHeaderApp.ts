import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const APP_SECRET = process.env.KUDOKU_APP_SECRET as string;

export interface AppAuthTokenPayload {
  userId: string;
}

export function decodeAuthHeaderApp(
  authHeader: String,
  res: Response
): AppAuthTokenPayload {
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    res.status(400).send('No token found');
    throw new Error('No token found');
  }

  return jwt.verify(token, APP_SECRET) as AppAuthTokenPayload;
}

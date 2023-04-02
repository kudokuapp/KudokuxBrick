import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const BGST_APP_SECRET = process.env.BGST_APP_SECRET as string;

export interface BgstAuthTokenPayload {
  email: string;
}

export function decodeAuthHeaderBgst(
  authHeader: String,
  res: Response
): BgstAuthTokenPayload {
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    res.status(400).send('No token found');
    throw new Error('No token found');
  }

  return jwt.verify(token, BGST_APP_SECRET) as BgstAuthTokenPayload;
}

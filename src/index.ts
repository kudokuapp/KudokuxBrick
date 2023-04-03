import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { MongoClient, Db } from 'mongodb';
import { Pool, PoolClient } from 'pg';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

// MongoDB connection setup
const mongoClient = new MongoClient(process.env.MONGODB_URI as string);
let mongoDb: Db;

async function connectToMongo(req: Request, res: Response, next: NextFunction) {
  try {
    await mongoClient.connect();
    console.log('Connected to MongoDB database');
    req.db = mongoClient.db();
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error connecting to MongoDB database');
  }
}

declare global {
  namespace Express {
    interface Request {
      db: Db;
    }
  }
}

app.use(connectToMongo);

// PostgreSQL connection setup
const pgPool = new Pool({
  user: process.env.POSTGRES_DB_USERNAME as string,
  password: process.env.POSTGRES_DB_PASSWORD as string,
  host: process.env.POSTGRES_DB_HOST as string,
  port: Number(process.env.POSTGRES_DB_PORT),
  database: process.env.POSTGRES_DB_DATABASE as string,
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.POSTGRES_DB_PGCACERT as string,
  },
});

async function connectToPostgres(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const client: PoolClient = await pgPool.connect();
    console.log('Connected to PostgreSQL database');
    req.pg = client;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error connecting to PostgreSQL database');
  }
}

declare global {
  namespace Express {
    interface Request {
      pg: PoolClient;
    }
  }
}

app.use(connectToPostgres);

app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://app.kudoku.id',
    'https://bgst.kudoku.id',
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    // add type assertion
    res.setHeader('Access-Control-Allow-Origin', origin as string); // add type assertion
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const bcaRoute = require('./routes/Bca');
const gopayRoute = require('./routes/Gopay');
const utilsRoute = require('./routes/Utils');

app.use(bodyParser.json());

app.use('/bca', bcaRoute);
app.use('/gopay', gopayRoute);
app.use('/utils', utilsRoute);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

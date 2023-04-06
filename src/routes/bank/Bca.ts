import express from 'express';
import { ObjectId } from 'mongodb';
import {
  brickPublicAccessToken,
  brickUrl,
  getAccountDetail,
  getClientIdandRedirectRefId,
} from '../../../utils/brick';
import {
  decodeAuthHeaderApp,
  decodeAuthHeaderBgst,
} from '../../../utils/authHeader';
import axios from 'axios';
import moment from 'moment';

const router = express.Router();

router.post('/token', async (req, res) => {
  try {
    const { type, brickInstitutionId, username, password } = req.body;

    if (
      brickInstitutionId !== 2 &&
      brickInstitutionId !== 37 &&
      brickInstitutionId !== 38
    )
      return res
        .status(400)
        .send('Brick Institution ID yang tidak valid untuk BCA.');

    // start verification
    const authHeader = req.headers.authorization;

    let brickUserId: string | null = null;

    if (!authHeader) return res.status(400).send('Invalid header');

    if (type === 'kudoku-app') {
      const { userId: _userId } = decodeAuthHeaderApp(authHeader, res);

      const collection = req.db.collection('User');

      const userId = new ObjectId(_userId);

      const user = await collection.findOne({ _id: userId });

      if (!user)
        return res.status(404).send(`User with ID ${_userId} not found`);

      brickUserId = _userId;
    } else if (type === 'BGST') {
      const { email } = decodeAuthHeaderBgst(authHeader, res);

      const result = await req.pg.query('SELECT * FROM User WHERE email = $1', [
        email,
      ]);

      if (result.rows.length === 0)
        return res.status(404).send(`User with email ${email} not found`);

      brickUserId = email;
    } else {
      return res.status(400).send('Invalid type');
    }

    if (brickUserId === null)
      return res.status(404).send(`brickUserId is null`);
    // end verification

    const { clientId, redirectRefId } = await getClientIdandRedirectRefId(
      brickUserId
    );

    const url = brickUrl(`/v1/auth/${clientId}`);

    const options = {
      method: 'POST',
      url: url.href,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${brickPublicAccessToken}`,
      },
      data: {
        institutionId: brickInstitutionId,
        username,
        password,
        redirectRefId,
      },
    };

    const {
      data: { data },
    }: { data: { data: BrickTokenData } } = await axios.request(options);

    res.status(200).json({ ...data });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Fatal error');
  }
});

router.post('/account', async (req, res) => {
  try {
    const { type, accessToken } = req.body;

    // start verification
    const authHeader = req.headers.authorization;

    let brickUserId: string | null = null;

    if (!authHeader) return res.status(400).send('Invalid header');

    if (type === 'kudoku-app') {
      const { userId: _userId } = decodeAuthHeaderApp(authHeader, res);

      const collection = req.db.collection('User');

      const userId = new ObjectId(_userId);

      const user = await collection.findOne({ _id: userId });

      if (!user)
        return res.status(404).send(`User with ID ${_userId} not found`);

      brickUserId = _userId;
    } else if (type === 'BGST') {
      const { email } = decodeAuthHeaderBgst(authHeader, res);

      const result = await req.pg.query('SELECT * FROM User WHERE email = $1', [
        email,
      ]);

      if (result.rows.length === 0)
        return res.status(404).send(`User with email ${email} not found`);

      brickUserId = email;
    } else {
      return res.status(400).send('Invalid type');
    }

    if (brickUserId === null)
      return res.status(404).send(`brickUserId is null`);
    // end verification

    const { clientId, redirectRefId } = await getClientIdandRedirectRefId(
      brickUserId
    );

    const accountDetail = await getAccountDetail(accessToken);

    res.status(200).json({ ...accountDetail[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Fatal error');
  }
});

router.post('/transaction', async (req, res) => {
  try {
    const { type, accessToken, from } = req.body;

    // start verification
    const authHeader = req.headers.authorization;

    let brickUserId: string | null = null;

    if (!authHeader) return res.status(400).send('Invalid header');

    if (type === 'kudoku-app') {
      const { userId: _userId } = decodeAuthHeaderApp(authHeader, res);

      const collection = req.db.collection('User');

      const userId = new ObjectId(_userId);

      const user = await collection.findOne({ _id: userId });

      if (!user)
        return res.status(404).send(`User with ID ${_userId} not found`);

      brickUserId = _userId;
    } else if (type === 'BGST') {
      const { email } = decodeAuthHeaderBgst(authHeader, res);

      const result = await req.pg.query('SELECT * FROM User WHERE email = $1', [
        email,
      ]);

      if (result.rows.length === 0)
        return res.status(404).send(`User with email ${email} not found`);

      brickUserId = email;
    } else {
      return res.status(400).send('Invalid type');
    }

    if (brickUserId === null)
      return res.status(404).send(`brickUserId is null`);
    // end verification

    const transactionUrl = brickUrl(`/v1/transaction/list`);

    const to = moment().format('YYYY-MM-DD');

    const transactionOptions = {
      method: 'GET',
      url: transactionUrl.href,
      params: { from, to },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const {
      data: { data: transactionData },
    }: { data: { data: BrickTransactionData[] } } = await axios.request(
      transactionOptions
    );

    res.status(200).json(transactionData);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Fatal error');
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { type, accessToken, from } = req.body;

    // start verification
    const authHeader = req.headers.authorization;

    let brickUserId: string | null = null;

    if (!authHeader) return res.status(400).send('Invalid header');

    if (type === 'kudoku-app') {
      const { userId: _userId } = decodeAuthHeaderApp(authHeader, res);

      const collection = req.db.collection('User');

      const userId = new ObjectId(_userId);

      const user = await collection.findOne({ _id: userId });

      if (!user)
        return res.status(404).send(`User with ID ${_userId} not found`);

      brickUserId = _userId;
    } else if (type === 'BGST') {
      const { email } = decodeAuthHeaderBgst(authHeader, res);

      const result = await req.pg.query('SELECT * FROM User WHERE email = $1', [
        email,
      ]);

      if (result.rows.length === 0)
        return res.status(404).send(`User with email ${email} not found`);

      brickUserId = email;
    } else {
      return res.status(400).send('Invalid type');
    }

    if (brickUserId === null)
      return res.status(404).send(`brickUserId is null`);
    // end verification

    const accountDetail = await getAccountDetail(accessToken);

    /**
     * Pull the initial transaction for the month
     * We pull 7 days before only
     */

    const transactionUrl = brickUrl(`/v1/transaction/list`);

    const to = moment().format('YYYY-MM-DD');

    const transactionOptions = {
      method: 'GET',
      url: transactionUrl.href,
      params: { from, to },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const {
      data: { data: transactionData },
    }: { data: { data: BrickTransactionData[] } } = await axios.request(
      transactionOptions
    );

    res
      .status(200)
      .json({ account: accountDetail, transaction: transactionData });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Fatal error');
  }
});

module.exports = router;

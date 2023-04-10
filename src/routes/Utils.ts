import express from 'express';
import { ObjectId } from 'mongodb';
import { isAccessTokenIsExpired } from '../../utils/brick';
import {
  decodeAuthHeaderApp,
  decodeAuthHeaderBgst,
} from '../../utils/authHeader';

const router = express.Router();

router.post('/checkifexpired', async (req, res) => {
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

      const result = await req.pg.query(
        'SELECT * FROM "User" WHERE "email"=$1',
        [email]
      );

      if (result.rows.length === 0)
        return res.status(404).send(`User with email ${email} not found`);

      brickUserId = email;
    } else {
      return res.status(400).send('Invalid type');
    }

    if (brickUserId === null)
      return res.status(404).send(`brickUserId is null`);
    // end verification

    const expired = await isAccessTokenIsExpired(accessToken);

    res.status(200).json({ expired });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Fatal error');
  }
});

module.exports = router;

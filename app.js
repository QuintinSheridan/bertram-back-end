

import vine from '@vinejs/vine';
import db from './db/db.js'
import express from 'express'
import cors from 'cors'

const userSchema = vine.object({
  userName: vine.string(),
  password: vine.string(),
});

const app = express()
app.use(express.json());
app.use(cors())
const port = process.env.PORT || 3000;


app.post('/register', async (req, res) => {
  const { userName, password } = req.body

  try {
    const validatedData = await vine.validate({
      schema: userSchema,
      data: req.body,
    });
  } catch (error) {
    console.error(error.messages);
  }

  const sql = 'INSERT INTO users (user_name, password) VALUES (?, ?)';
  db.run(sql, [userName, password], function (err) {
      if (err) {
          console.error('Error inserting user:', err.message);
          return res.status(500).json({ error: 'Failed to create user.' });
      }
      res.status(201).json({ message: 'User created successfully', id: this.lastID, userName });
  });
})

app.post('/login', async (req, res) => {
  const { userName, password } = req.body

  try {
    const validatedData = await vine.validate({
      schema: userSchema,
      data: req.body,
    });
  } catch (error) {
    console.error(error.messages);
  }

  db.get('SELECT id FROM users WHERE user_name = ? and password = ?', [userName, password], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error retrieving user');
    }
    if (!row) {
      return res.status(404).send('User not found');
    }
    res.status = 200
    res.send({
      "action": "login success",
      "userId": row.id
  })
  })
})

app.post('/session/create', async (req, res) => {
  const { userCount } = req.body
  console.log("userCount: ", userCount)

  const userCountSchema = vine.object({
    userCount: vine.number(),
  });

  try {
    const validatedData = await vine.validate({
      schema: userCountSchema,
      data: req.body,
    });
  } catch (error) {
    console.error(error.messages);
  }

  const sql = 'INSERT INTO session_payment (user_count) VALUES (?)';
  db.run(sql, userCount, function (err) {
      if (err) {
          console.error('Error inserting session:', err.message);
          return res.status(500).json({ error: 'Failed to create session.' });
      }
      res.status(201).json({ message: 'Session created successfully', id: this.lastID, userCount });
  });
})

app.post('/session/result', async (req, res) => {
  const { sessionId } = req.body

  console.log("sessionId: ", sessionId)

  const sessionResultSchema = vine.object({
    sessionId: vine.number()
  });

  try {
    const validatedData = await vine.validate({
      schema: sessionResultSchema,
      data: req.body,
    });
  } catch (error) {
    console.error(error.messages);
  }

  const sql = 'SELECT * FROM session_payment AS sp INNER JOIN users AS u ON sp.user_id = u.id WHERE sp.id=?';

  db.get(sql, [sessionId], function (err, row) {
      if (err) {
          console.error('Error looking up session result:', err.message);
          return res.status(500).json({ error: 'Failed to look up session result.' });
      }

      // console.log('row: ', row)

      res.status(201).json({ message: 'Session results looked up', sessionId, userId: row?.user_id, userName: row?.user_name, amount: row?.amount });
    })
})


app.post('/session/status', async (req, res) => {
  const { userId, sessionId } = req.body

  console.log("userId: ", userId)
  console.log("sessionId: ", sessionId)

  const userCountSchema = vine.object({
    userId: vine.number(),
    sessionId: vine.number()
  });

  try {
    const validatedData = await vine.validate({
      schema: userCountSchema,
      data: req.body,
    });
  } catch (error) {
    console.error(error.messages);
  }

  const sql = 'SELECT * FROM sessions WHERE user_id=? and session_id=?';
  db.get(sql, [userId, sessionId], function (err, row) {
      if (err) {
          console.error('Error looking up session:', err.message);
          return res.status(500).json({ error: 'Failed to create session.' });
      }

      console.log('row: ', row)

      if(row && row.vote) {
        console.log('User session found')
        res.status(201).json({ message: 'User session confirmed', sessionId, userId, vote: row.vote, amount: row.amount });
      } else {
        console.log('Creating user session')
        const sql="INSERT INTO sessions (user_id, session_id) VALUES(?,?)"
        db.run(sql, [userId, sessionId], function (err, row) {
          if (err) {
              console.error('Err:or creating user session', err.message);
              return res.status(500).json({ error: 'Failed to create session.' });
          }
          res.status(201).json({ message: 'User session confirmed', sessionId, userId, vote:undefined, amount: undefined });
        })
      }
  });
})


app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}/`);
});
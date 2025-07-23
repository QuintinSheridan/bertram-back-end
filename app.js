

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
      res.status(201).json({ message: 'User created successfully', id: this.lastID, userCount });
  });
})

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}/`);
});
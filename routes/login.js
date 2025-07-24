import express from 'express'
import db from '../db/db.js'
import vine from '@vinejs/vine'

const router  = express.Router()

router.post('/login', async (req, res) => {
  const { userName, password } = req.body
  const userSchema = vine.object({
    userName: vine.string(),
    password: vine.string(),
  });

  try {
    const validatedData = await vine.validate({
      schema: userSchema,
      data: req.body,
    });
  } catch (error) {
    console.error(error.messages);
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.messages
    });
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


export default router
import express from 'express'
import db from '../db/db.js'
import vine from '@vinejs/vine'

const router  = express.Router()

router.post('/register', async (req, res) => {
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

    const sql = 'INSERT INTO users (user_name, password) VALUES (?, ?)';
    db.run(sql, [userName, password], function (err) {
        if (err) {
            console.error('Error inserting user:', err.message);
            return res.status(500).json({ error: 'Failed to create user.' });
        }
        res.status(201).json({ message: 'User created successfully', id: this.lastID, userName });
    });
  })


export default router
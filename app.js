

import vine from '@vinejs/vine';
import db from './db/db.js'
import express from 'express'
import cors from 'cors'
import loginRouter from './routes/login.js'
import regsterRouter from './routes/register.js'
import sessionRouter from './routes/session.js'

const userSchema = vine.object({
  userName: vine.string(),
  password: vine.string(),
});

const app = express()
app.use(express.json());
app.use(cors())
const port = process.env.PORT || 3000;
app.use(loginRouter)
app.use(regsterRouter)
app.use(sessionRouter)

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}/`);
});
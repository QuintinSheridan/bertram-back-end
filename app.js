

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



// app.post('/register', async (req, res) => {
//   const { userName, password } = req.body

//   try {
//     const validatedData = await vine.validate({
//       schema: userSchema,
//       data: req.body,
//     });
//   } catch (error) {
//     console.error(error.messages);
//     return res.status(400).json({
//       message: 'Validation failed',
//       errors: error.messages
//     });
//   }

//   const sql = 'INSERT INTO users (user_name, password) VALUES (?, ?)';
//   db.run(sql, [userName, password], function (err) {
//       if (err) {
//           console.error('Error inserting user:', err.message);
//           return res.status(500).json({ error: 'Failed to create user.' });
//       }
//       res.status(201).json({ message: 'User created successfully', id: this.lastID, userName });
//   });
// })

// app.post('/login', async (req, res) => {
//   const { userName, password } = req.body

//   try {
//     const validatedData = await vine.validate({
//       schema: userSchema,
//       data: req.body,
//     });
//   } catch (error) {
//     console.error(error.messages);
//     return res.status(400).json({
//       message: 'Validation failed',
//       errors: error.messages
//     });
//   }

//   db.get('SELECT id FROM users WHERE user_name = ? and password = ?', [userName, password], (err, row) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Error retrieving user');
//     }
//     if (!row) {
//       return res.status(404).send('User not found');
//     }
//     res.status = 200
//     res.send({
//       "action": "login success",
//       "userId": row.id
//   })
//   })
// })

// app.post('/session/create', async (req, res) => {
//   const { userCount } = req.body
//   console.log("userCount: ", userCount)

//   const userCountSchema = vine.object({
//     userCount: vine.number(),
//   });

//   try {
//     const validatedData = await vine.validate({
//       schema: userCountSchema,
//       data: req.body,
//     });
//   } catch (error) {
//     console.error(error.messages);
//     return res.status(400).json({
//       message: 'Validation failed',
//       errors: error.messages
//     });
//   }

//   const sql = 'INSERT INTO session_payment (user_count) VALUES (?)';
//   db.run(sql, userCount, function (err) {
//       if (err) {
//           console.error('Error inserting session:', err.message);
//           return res.status(500).json({ error: 'Failed to create session.' });
//       }
//       res.status(201).json({ message: 'Session created successfully', id: this.lastID, userCount });
//   });
// })

// app.post('/session/result', async (req, res) => {
//   const { sessionId } = req.body

//   console.log("sessionId: ", sessionId)

//   const sessionResultSchema = vine.object({
//     sessionId: vine.number()
//   });

//   try {
//     const validatedData = await vine.validate({
//       schema: sessionResultSchema,
//       data: req.body,
//     });
//   } catch (error) {
//     console.error(error.messages);
//     return res.status(400).json({
//       message: 'Validation failed',
//       errors: error.messages
//     });
//   }

//   const sql = 'SELECT * FROM session_payment AS sp INNER JOIN users AS u ON sp.user_id = u.id WHERE sp.id=?';

//   db.get(sql, [sessionId], function (err, row) {
//       if (err) {
//           console.error('Error looking up session result:', err.message);
//           return res.status(500).json({ error: 'Failed to look up session result.' });
//       }

//       res.status(201).json({ message: 'Session results looked up', sessionId, userId: row?.user_id, userName: row?.user_name, amount: row?.amount, vote: row?.vote });
//     })
// })

// /// *** session status
// app.post('/session/status', async (req, res) => {
//   const { userId, sessionId } = req.body

//   console.log("userId: ", userId)
//   console.log("sessionId: ", sessionId)

//   const userCountSchema = vine.object({
//     userId: vine.number(),
//     sessionId: vine.number()
//   });

//   try {
//     const validatedData = await vine.validate({
//       schema: userCountSchema,
//       data: req.body,
//     });
//   } catch (error) {
//     console.error(error.messages);
//     return res.status(400).json({
//       message: 'Validation failed',
//       errors: error.messages
//     });
//   }

//   const sql = 'SELECT * FROM sessions WHERE user_id=? and session_id=?';
//   db.get(sql, [userId, sessionId], function (err, row) {
//       if (err) {
//           console.error('Error looking up session:', err.message);
//           return res.status(500).json({ error: 'Failed to create session.' });
//       }

//       console.log('row: ', row)

//       if(row && row.vote) {
//         console.log('User session found')
//         res.status(201).json({ message: 'User session confirmed', sessionId, userId, vote: row.vote, amount: row.amount });
//       } else {
//         console.log('Creating user session')
//         const sql="INSERT INTO sessions (user_id, session_id) VALUES(?,?)"
//         db.run(sql, [userId, sessionId], function (err, row) {
//           if (err) {
//               console.error('Err:or creating user session', err.message);
//               return res.status(500).json({ error: 'Failed to create session.' });
//           }
//           res.status(201).json({ message: 'User session confirmed', sessionId, userId, vote:undefined, amount: undefined });
//         })
//       }
//   });
// })

//   /// *** session status
// app.post('/session/vote', async (req, res) => {
//   const { userId, sessionId, vote, amount } = req.body

//   console.log("userId: ", userId)
//   console.log("sessionId: ", sessionId)

//   const sessionVoteSchema = vine.object({
//     userId: vine.number(),
//     sessionId: vine.number(),
//     method: vine.string(),
//     amount: vine.number()
//   });

//   try {
//     const sessionVoteSchema = await vine.validate({
//       schema: userCountSchema,
//       data: req.body,
//     });
//   } catch (error) {
//     console.error(error.messages);
//     return res.status(400).json({
//       message: 'Validation failed',
//       errors: error.messages
//     });
//   }

//   // get the user count
//   let userCount
//   const sqlSession = 'SELECT user_count FROM session_payment WHERE id=?';
//   await db.get(sqlSession, [ sessionId], function (err, row) {
//     if (err) {
//         console.error('Error looking up session:', err.message);
//         return res.status(500).json({ error: 'Failed to get session info.' });
//     }

//     console.log('row: ', row)

//     if(row && row?.user_count) {
//       console.log('Session found')
//       userCount = userCount

//     } else {
//       return res.status(404).send({
//         error: "Session not found."
//       })
//     }
//   })

//   // write user vote to db
//   let responseBody

//   console.log('making insertion...')

//   const sqlVoteInsert = 'INSERT INTO sessions (user_id, session_id, vote, amount) VALUES (?, ?, ?, ?)';
//   await db.run(sqlVoteInsert, [ userId, sessionId, vote, amount], function (err) {
//       if (err) {
//           console.error('Error inserting session:', err.message);
//           return res.status(500).json({ error: 'Failed to cast user vote.', userId, sessionId, vote, amount});
//       }
//       responseBody = {message: "User vote caast.", userId, sessionId, vote, amount};
//   });

//   return res.status(201).json(responseBody)

//   // // get existing user votes to find out if a selection should be made
//   // let votesCount = 0
//   // let userVotes = []
//   // const sqlGetVotes = 'SELECT * FROM sessions WHERE id=? and VOTE IS NOT NULL';
//   // db.get(sqlGetVotes, [ sessionId ], function (err, rows) {
//   //     if (err) {
//   //         console.error('Error looking up session votes:', err.message);
//   //         return res.status(500).json({ error: 'Failed to get session votes.' });
//   //     }
//   //     console.log('rows: ', rows)
//   //     if(rows)
//   //       votesCount = rows.length
//   //       userVotes = rows
//   //     })
//   // });

//   // if(votesCount === userCount){
//   //   const decision = getPayer(userVotes)
//   // }

//   // processDecision(decision)

//   // return res.status(500).json({ error: 'Failed to cast user vote.', userId, sessionId, vote, amount});

// })


app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}/`);
});
import express from 'express'

import vine from '@vinejs/vine'
import { getPayer, processDecision, getUserCount, getUserStatus, insertVote, getSessionVotes, insertSession, getSessionResult } from '../utils/session.js'

const router  = express.Router()

router.post('/session/create', async (req, res) => {
    const { userCount } = req.body
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
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.messages
      });
    }

    // const sql = 'INSERT INTO session_payment (user_count) VALUES (?)';
    // db.run(sql, userCount, function (err) {
    //     if (err) {
    //         console.error('Error inserting session:', err.message);
    //         return res.status(500).json({ error: 'Failed to create session.' });
    //     }
    //     res.status(201).json({ message: 'Session created successfully', id: this.lastID, userCount });
    // });

    const insertSessionResult = await insertSession(userCount)

    console.log('insertSessionResult: ', insertSessionResult)

    if(insertSessionResult?.error) {
      return res.status(500).json(insertSessionResult)
    }

    return res.status(201).json(insertSessionResult)

  })

  router.post('/session/result', async (req, res) => {
    const { sessionId } = req.body
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
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.messages
      });
    }

    // const sql = 'SELECT * FROM session_payment AS sp INNER JOIN users AS u ON sp.user_id = u.id WHERE sp.id=?';

    // db.get(sql, [sessionId], function (err, row) {
    //     if (err) {
    //         console.error('Error looking up session result:', err.message);
    //         return res.status(500).json({ error: 'Failed to look up session result.' });
    //     }

    //     res.status(201).json({ message: 'Session results looked up', sessionId, userId: row?.user_id, userName: row?.user_name, amount: row?.amount, vote: row?.vote });
    //   })

    const resultResponse = await getSessionResult(sessionId)
    if(resultResponse?.error) {
      return res.status(500).json(resultResponse)
    }

    return res.status(200).json(resultResponse)

  })

  /// *** session status
  router.post('/session/status', async (req, res) => {
    const { userId, sessionId } = req.body
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
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.messages
      });
    }

    // const sql = 'SELECT * FROM sessions WHERE user_id=? and session_id=?';
    // await db.get(sql, [userId, sessionId], async function (err, row) {
    //     if (err) {
    //         console.error('Error looking up session:', err.message);
    //         return res.status(500).json({ error: 'Failed to create session.' });
    //     }

    //     if(row) {
    //       console.log('User session found')
    //       res.status(201).json({ message: 'User session voting confirmed', sessionId, userId, vote: row.vote, amount: row.amount });
    //     } else {
    //       console.log('Creating user session')
    //       const sql="INSERT INTO sessions (user_id, session_id) VALUES(?,?)"
    //       await db.run(sql, [userId, sessionId], function (err, row) {
    //         if (err) {
    //             console.error('Err:or creating user session', err.message);
    //             return res.status(500).json({ error: 'Failed to create session.' });
    //         }
    //         res.status(201).json({ message: 'User session created', sessionId, userId, vote:undefined, amount: undefined });
    //       })
    //     }
    // });

    const userStatusResponse = await getUserStatus(userId, sessionId)

    if(userStatusResponse?.error) {
      return res.status(500).json(userStatusResponse)
    }

    return res.status(200).json(userStatusResponse)
  })

  /// *** session vote
  router.post('/session/vote', async (req, res) => {
    const { userId, sessionId, vote, amount } = req.body
    const sessionVoteSchema = vine.object({
      userId: vine.number(),
      sessionId: vine.number(),
      vote: vine.string(),
      amount: vine.number()
    });

    try {
      const validatedData = await vine.validate({
        schema: sessionVoteSchema,
        data: req.body,
      });
    } catch (error) {
      console.error(error.messages);
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.messages
      });
    }

    // let userCount = undefined

    // const sqlSession = 'SELECT user_count FROM session_payment WHERE id=?';
    // await db.get(sqlSession, [ sessionId], function (err, row) {
    //   if (err) {
    //       console.error('Error looking up session:', err.message);
    //       return res.status(500).json({ error: 'Failed to get session info.' });
    //   }

    //   if(row && row?.user_count) {
    //     userCount = row?.user_count
    //   } else {
    //     return res.status(404).send({
    //       error: "Session not found."
    //     })
    //   }
    // })
    const countResponse = await getUserCount(sessionId)

    if(countResponse?.error) {
      return res.status(500).json(countResponse)
    }

    console.log('countResponse: ', countResponse)
    const {userCount} = countResponse

    let responseBody

    console.log('making insertion...')

    // const sqlVoteInsert = 'UPDATE sessions SET amount=?, vote=? WHERE user_id=? AND session_id=?';
    // await db.run(sqlVoteInsert, [ amount, vote, userId, sessionId], function (err) {
    //     if (err) {
    //         console.error('Error inserting session:', err.message);
    //         return res.status(500).json({ error: 'Failed to cast user vote.', userId, sessionId, vote, amount});
    //     }
    //     responseBody = {message: "User vote caast.", userId, sessionId, vote, amount};
    // });

    const insertResponse = await insertVote(amount, vote, userId, sessionId)
    console.log("vote response: ", insertResponse)

    // get existing user votes to find out if a selection should be made
    // let votesCount = 0
    // let userVotes = []
    // const sqlGetVotes = 'SELECT * FROM sessions WHERE session_id=? and VOTE IS NOT NULL';
    // await db.all(sqlGetVotes, [sessionId], async function (err, rows) {
    //   if (err) {
    //     console.error('Error looking up session votes:', err.message)
    //     return res.status(500).json({ error: 'Failed to get session votes.' })
    //   }

    //   if (rows) {
    //     userVotes = rows?.user_id ? [rows] : rows
    //     votesCount = userVotes.length
    //   }
    console.log("getting session votes...")
    const sessionVotesResponse = await getSessionVotes(sessionId)
    console.log("sessionVotesResponse: ", sessionVotesResponse)

    if(sessionVotesResponse?.error) {
      return res.status(500).json(sessionVotesResponse)
    }

    const {userVotes, votesCount} = sessionVotesResponse

    if (votesCount === userCount) {
      console.log('choosing payer...')
      const decision = await getPayer(userVotes, sessionId)
      console.log("\n\n\n decision: ", decision)
      const processDecisionResult = await processDecision(decision)
    } else {
      console.log("votes_count: ", votesCount)
      console.log("userCount: ", userCount)
    }

    return res.status(201).json(insertResponse)
  })


export default router
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

    const insertSessionResult = await insertSession(userCount)

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

    const resultResponse = await getSessionResult(sessionId)
    if(resultResponse?.error) {
      return res.status(500).json(resultResponse)
    }

    return res.status(200).json(resultResponse)

  })


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

    const userStatusResponse = await getUserStatus(userId, sessionId)

    if(userStatusResponse?.error) {
      return res.status(500).json(userStatusResponse)
    }

    return res.status(200).json(userStatusResponse)
  })


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

    const countResponse = await getUserCount(sessionId)

    if(countResponse?.error) {
      return res.status(500).json(countResponse)
    }

    const {userCount} = countResponse

    const insertResponse = await insertVote(amount, vote, userId, sessionId)
    if(insertResponse?.error) {
      return res.status(500).json(insertResponse)
    }

    const sessionVotesResponse = await getSessionVotes(sessionId)

    if(sessionVotesResponse?.error) {
      return res.status(500).json(sessionVotesResponse)
    }

    const {userVotes, votesCount} = sessionVotesResponse

    if (votesCount === userCount) {
      const decision = await getPayer(userVotes, sessionId)
      const processDecisionResult = await processDecision(decision)
    }

    return res.status(201).json(insertResponse)
  })


export default router
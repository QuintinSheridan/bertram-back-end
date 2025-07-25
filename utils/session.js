import db from '../db/dbHandle.js'


export const getPayer = async (userVotes, sessionId) => {
    const totalAmount = userVotes.reduce((accumulator, vote) => {
        return accumulator + vote.amount
    }, 0)
    console.log("total amount: ", totalAmount)

    // count the vote types and determine a type
    const voteCounts = {}
    for(let vote of userVotes) {
        if(vote.vote in voteCounts){
            voteCounts[vote.vote] += 1
        }else{
            voteCounts[vote.vote] = 1
        }
    }

    let tybreakers = []
    let maxCount = 0

    console.log('voteCounts: ', voteCounts)

    Object.entries(voteCounts).forEach(([key, value]) => {
        if(value > maxCount) {
            maxCount = value
            tybreakers = [key]
        } else if(value === maxCount) {
            tybreakers.append(key)
        }
    })

    let selectionMethod

    if(tybreakers.lenght === 1) {
        selectionMethod = tybreakers[0]
    } else {
        const randomIndex = Math.floor(Math.random() * tybreakers.length);
        selectionMethod = tybreakers[randomIndex]
    }

    let payerId

    switch (selectionMethod) {
        case 'random':
            const randomIndex = Math.floor(Math.random() * userVotes.length);
            const vote = userVotes[randomIndex]
            payerId = vote.user_id
            break

        case 'highestOrder':
            let highestOrder = 0
            let highestUser = undefined
            for (let vote of userVotes){
                if(vote.amount > highestOrder) {
                    highestOrder = vote.amount
                    highestUser = vote.user_id
                }
            }

            payerId = highestUser
            break

        case 'lowestOrder':
            let lowestOrder = undefined
            let lowestUser = undefined
            for( let vote of userVotes){
                if(vote.amount < lowestOrder || !lowestOrder) {
                    lowestOrder = vote.amount
                    lowestUser = vote.user_id
                }
            }
            payerId = lowestUser

            break

        case 'squareUp':
            // Note: a more complicated way to square up would
            // bet to create an object for each user showing their defficit related to each other user
            // and then to sum the deficits to show who owes the group more accurately, however this would
            // greatly increases the workload and add more queries to get each users deficit
            // we will assume a simple case where the same group of people are expected to use the app together regularly
            // so for our simple case, we will just look at deficit as total amount spent - total amount purchased

            // const deficits = {}

            // TODO replace with single sql query grouping by user id
            // for(let vote of userVotes) {
            //     const userId = vote.userId
            //     sql = 'SELECT (SELECT SUM(amount) FROM session_payment where user_id=?) - (SELECT SUM(amount) FROM purchases WHERE user_id=?) AS deficit;'
            //     await db.get(sql, userId, (err, row) => {
            //         if (err) {
            //             console.error('Error getting user deficits', err.message, userId);
            //             return res.status(500).json({ error: 'Error getting user deficit.', userId, sessionId, vote, amount});
            //         }

            //         if(row && row?.deficit) {
            //             deficits[userId] = row.deficit
            //         }
            //     })
            // }

            const deficits = {}

            const deficitSQL = `select
            (SELECT TOTAL(s.amount) from session_payment sp inner join sessions as s on s.session_id = sp.id where sp.user_id=? and s.user_id=?) -
            (SELECT TOTAL(s.amount) from session_payment sp inner join sessions as s on s.session_id = sp.id where sp.user_id=? and s.user_id=?) as deficit
            `

            console.log('userVotes: ', userVotes)
            const numVotes = userVotes.length

            for(let i = 0; i < userVotes.length; i++){
                const vote_i = userVotes[i]
                console.log('vote_i: ', vote_i)
                const iUserId = vote_i.user_id
                if( !(iUserId in deficits)){
                    deficits[String(iUserId)] = {}
                }
                for(let j = i+1; j < userVotes.length; j++){
                    const vote_j = userVotes[j]
                    console.log('vote_i: ', vote_i)
                    const jUserId = vote_j.user_id
                    if( !(jUserId in deficits)){
                        deficits[String(jUserId)] = {}
                    }
                    console.log(`Getting defict between ${iUserId} and ${jUserId}`)
                    try{
                        const deficitResult = await db.get(deficitSQL, [iUserId, jUserId, jUserId, iUserId])
                        console.log('deficitResult: ', deficitResult)
                        const ijDeficit = deficitResult?.deficit && deficitResult?.deficit !== null ? deficitResult.deficit : 0
                        // console.log('setting deficit')
                        // console.log('deficits: ', deficits)
                        deficits[String(iUserId)][String(jUserId)] = ijDeficit
                        deficits[String(jUserId)][String(iUserId)] = -1*ijDeficit
                        // if(ijDeficit === 0) {
                        //     console.log("setting deficit to 0")
                        //     deficits[String(jUserId)][String(iUserId)] = 0
                        // } else{
                        //     console.log("setting deficit to inverse")
                        //     deficits[String(jUserId)][String(iUserId)] = -1*ijDeficit
                        // }

                    } catch(e) {
                        console.error('Error looking up user deficit:', e);
                        return {error: "Error looking up user deficit:", userOne: iUserId, userTwo: jUserId}
                    }
                }
            }

            console.log("\n\n\n\ final deficits: ", deficits)

            let tybreakers = []
            let maxDeficit = undefined

            Object?.entries(deficits).forEach(([key, value]) => {
                // console.log("userId: ", key)
                // console.log("value: ", value)
                let totalDeficit = 0

                Object?.entries(value).forEach(([key, value]) => {
                    // console.log("to user id: ", key)
                    // console.log("deficit: ", value)
                    totalDeficit += value
                })

                if(totalDeficit < maxDeficit || !maxDeficit) {
                    tybreakers = [key]
                    maxDeficit = totalDeficit
                } else if(totalDeficit === maxDeficit) {
                    tybreakers.append(key)
                }
            })

            console.log('maxDeficit: ', maxDeficit)
            console.log('tybreakers : ', tybreakers)

            // Object.entries(voteCounts).forEach(([key, value]) => {
            //     if(!maxDeficit || value < maxDeficit) {
            //         maxDeficit = value
            //         tybreakers = [key]
            //     } else if(value === maxCount) {
            //         tybreakers.append(key)
            //     }
            // })

            if(tybreakers.lenght === 1) {
                payerId = parseInt(tybreakers[0])
            } else {
                const randomIndex = Math.floor(Math.random() * tybreakers.length);
                payerId = parseInt(tybreakers[randomIndex])
    }
            break
    }


    return {
        payerId,
        totalAmount,
        selectionMethod,
        sessionId
    }
}

export const processDecision = async ({
    payerId,
    totalAmount,
    selectionMethod,
    sessionId
    }) => {
    console.log('derp: ', payerId,
        totalAmount,
        selectionMethod,
        sessionId)
    const sql="UPDATE session_payment SET user_id=?, vote=?, amount=? WHERE id=?"
    // await db.run(sql, [ payerId, selectionMethod, totalAmount, sessionId], function (err) {
    //     if (err) {
    //         console.error('Error updating session payment:', err.message);
    //         return {error: "Error updating session", userId: payerId, sessionId, vote:selectionMethod, amount:totalAmount}
    //     }
    //     const responseBody = {message: "Session concluded", userId: payerId, sessionId, vote:selectionMethod, amount:totalAmount};
    //     return responseBody
    // });
    try{
        const reult = await db.run(sql, [ payerId, selectionMethod, totalAmount, sessionId])
        return {message: "Session concluded", userId: payerId, sessionId, vote:selectionMethod, amount:totalAmount};
    } catch(e) {
        return {error: "Error updating session", userId: payerId, sessionId, vote:selectionMethod, amount:totalAmount}
    }
}

export const getUserCount = async (sessionId) => {
    let userCount = undefined

    const sqlSession = 'SELECT user_count FROM session_payment WHERE id=?';
    // await db.get(sqlSession, [ sessionId], function (err, row) {
    //   if (err) {
    //       console.error('Error looking up session:', err.message);
    //       return res.status(500).json({ error: 'Failed to get session info.' });
    //   }

    //   if(row && row?.user_count) {
    //     userCount = row?.user_count
    //   } else {
    //       return {error: "Session not found."}
    //     }
    // })
    try{
        const result = await db.get(sqlSession, [ sessionId])

        return {userCount: result.user_count}
    } catch(e) {
        return {error: "Session not found."}
    }
}

export const insertVote = async (amount, vote, userId, sessionId) => {
    const sqlVoteInsert = 'UPDATE sessions SET amount=?, vote=? WHERE user_id=? AND session_id=?';
    // await db.run(sqlVoteInsert, [ amount, vote, userId, sessionId], function (err) {
    //     if (err) {
    //         console.error('Error inserting session:', err.message);
    //         return {error: 'Error inserting session'}
    //     }
    //     return {message: "User vote caast.", userId, sessionId, vote, amount};
    // });

    try {
        const result = await db.run(sqlVoteInsert, [ amount, vote, userId, sessionId])
        return {message: "User vote caast.", userId, sessionId, vote, amount};
    } catch(e) {
        return {error: 'Error inserting session'}
    }
}

export const getSessionVotes = async (sessionId) => {
    const sqlGetVotes = 'SELECT * FROM sessions WHERE session_id=? and VOTE IS NOT NULL';
    // await db.all(sqlGetVotes, [sessionId], async function (err, rows) {
    //   if (err) {
    //     console.error('Error looking up session votes:', err.message)
    //     return { error: 'Failed to get session votes.' }
    //   }

    //   if (rows) {
    //     userVotes = rows?.user_id ? [rows] : rows
    //     return {uservotes, votesCount: userVotes.length}
    //   }
    // })
    try{
        const result = await db.all(sqlGetVotes, [sessionId])
        console.log("derp result: ", result)
        const userVotes = result
        return {userVotes, votesCount: userVotes.length}
    } catch(e){
        return { error: 'Failed to get session votes.' }
    }

}

export const insertSession = async (userCount) => {
    console.log('inserting session...')
    const sql = 'INSERT INTO session_payment (user_count) VALUES (?) RETURNING id';
    let response = {}
    try{
        const result = await db.run(sql, [userCount])
        console.log('resultL: ', result)
        return { message: 'Session created successfully', id: result.lastID, userCount }
    } catch(e) {
        return { error: 'Failed to create session.' };
    }
}

export const getSessionResult = async (sessionId) => {
    const sql = 'SELECT * FROM session_payment AS sp INNER JOIN users AS u ON sp.user_id = u.id WHERE sp.id=?';
    // await db.get(sql, [sessionId], function (err, row) {
    //     if (err) {
    //         console.error('Error looking up session result:', err.message);
    //         return { error: 'Failed to look up session result.' };
    //     }

    //     return { message: 'Session results looked up', sessionId, userId: row?.user_id, userName: row?.user_name, amount: row?.amount, vote: row?.vote };
    //   })

    try {
        const result = await db.get(sql, [sessionId])
        return { message: 'Session results looked up', sessionId, userId: result?.user_id, userName: result?.user_name, amount: result?.amount, vote: result?.vote }
    } catch(e) {
        return { error: 'Failed to look up session result.' };
    }
}

export const getUserStatus = async(userId, sessionId) => {
    const sql = 'SELECT * FROM sessions WHERE user_id=? and session_id=?';
    // await db.get(sql, [userId, sessionId], async function (err, row) {
    //     if (err) {
    //         console.error('Error looking up session:', err.message);
    //         return { error: 'Failed to create session.' };
    //     }

    //     if(row) {
    //       console.log('User session found')
    //       return { message: 'User session voting confirmed', sessionId, userId, vote: row.vote, amount: row.amount };
    //     } else {
    //       console.log('Creating user session')
    //       const sql="INSERT INTO sessions (user_id, session_id) VALUES(?,?)"
    //       await db.run(sql, [userId, sessionId], function (err, row) {
    //         if (err) {
    //             console.error('Err:or creating user session', err.message);
    //             return res.status(500).json({ error: 'Failed to create session.' });
    //         }
    //         return { message: 'User session created', sessionId, userId, vote:undefined, amount: undefined };
    //       })
    //     }
    // });
    try{
        const result = await db.get(sql, [userId, sessionId])
        if(result){
            return { message: 'User session voting confirmed', sessionId, userId, vote: result.vote, amount: result.amount };
        } else{
            try{
                const insertSql="INSERT INTO sessions (user_id, session_id) VALUES(?,?)"
                const insertResult = await db.run(insertSql, [userId, sessionId])
                return { message: 'User session voting confirmed', sessionId, userId, vote: insertResult.vote, amount: insertResult.amount };

            } catch(e) {
                return { error: 'Failed to get user session.' };
            }
        }
    } catch(e) {
        return { error: 'Failed to get user session.' };
    }
}
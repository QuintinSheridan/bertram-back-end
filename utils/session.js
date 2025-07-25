import db from '../db/db.js'

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

            const deficits = {}

            // TODO replace with single sql query grouping by user id
            for(let vote of userVotes) {
                const userId = vote.userId
                sql = 'SELECT (SELECT SUM(amount) FROM session_payment where user_id=?) - (SELECT SUM(amount) FROM purchases WHERE user_id=?) AS deficit;'
                await db.get(sql, userId, (err, row) => {
                    if (err) {
                        console.error('Error getting user deficits', err.message, userId);
                        return res.status(500).json({ error: 'Error getting user deficit.', userId, sessionId, vote, amount});
                    }

                    if(row && row?.deficit) {
                        deficits[userId] = row.deficit
                    }
                })
            }

            let tybreakers = []
            let maxDeficit = undefined

            Object.entries(voteCounts).forEach(([key, value]) => {
                if(!maxDeficit || value < maxDeficit) {
                    maxDeficit = value
                    tybreakers = [key]
                } else if(value === maxCount) {
                    tybreakers.append(key)
                }
            })

            if(tybreakers.lenght === 1) {
                payerId = tybreakers[0]
            } else {
                const randomIndex = Math.floor(Math.random() * tybreakers.length);
                payerId = tybreakers[randomIndex]
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
    await db.run(sql, [ payerId, selectionMethod, totalAmount, sessionId], function (err) {
        if (err) {
            console.error('Error updating session payment:', err.message);
            return {error: "Error updating session", userId: payerId, sessionId, vote:selectionMethod, amount:totalAmount}
        }
        const responseBody = {message: "Session concluded", userId: payerId, sessionId, vote:selectionMethod, amount:totalAmount};
        return responseBody
    });
}
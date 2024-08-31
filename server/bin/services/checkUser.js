const { GoogleApis } = require('googleapis');
const db = require('../../knex/db');

const checkUser = async function(ID) {
    const userID = ID
    console.log(`UserID: ${userID}`)

    try {
        const user = await db('users').where({ clientID: userID }).first();

        if (user) {
            console.log(`User with clientID ${userID} exists.\n`);
        } else {
            console.log(`User with clientID ${userID} does not exist.`);

            try {
                await db('users').insert({ clientID: userID });
                console.log(`ClientID ${userID} inserted.\n`);
                return
            } catch (error) {
                console.error('Error inserting clientID:', error);
                return error
            }
        }
    } catch (error) {
        console.error('Error checking clientID:', error);
        return error
    }
}

module.exports = checkUser
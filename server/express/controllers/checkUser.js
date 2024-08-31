// Import necessary modules and constants
const { statusCodes } = require('../../bin/services/helperFile');
const db = require('../../knex/db');

/**
 * Checks if a user with a given clientID exists in the database.
 * If the user exists, it sends a success response indicating the user's presence.
 * If the user does not exist, it inserts the user into the database and then sends a success response.
 *
 * @param {Object} req - The request object from Express, containing the HTTP request data.
 * @param {Object} res - The response object from Express, used to send the HTTP response.
 *
 * @throws {Error} If an error occurs during database operations, a 500 Internal Server Error response is sent.
 *
 * @author jhwisnie
 */
const checkUser = async (req, res) => {
    // Extract userID from the request body
    const userID = req.body.value;

    // Log the received userID for debugging purposes
    console.log(`\n----------------\nRECEIVED: ${userID}\n----------------\n`);

    try {
        // Check if the user with the given clientID exists in the 'users' table
        const user = await db('users').where({ clientID: userID }).first();

        if (user) {
            // If user exists, log the existence and send a success response
            console.log(`User with clientID ${userID} exists.\n`);
            res.status(statusCodes.SUCCESS.OK).send(`User with clientID ${userID} exists.`);
        } else {
            // If user does not exist, log this fact and attempt to insert the new user
            console.log(`User with clientID ${userID} does not exist.`);

            try {
                // Insert the new user into the 'users' table
                await db('users').insert({ clientID: userID });
                console.log(`ClientID ${userID} inserted.\n`);
                res.status(statusCodes.SUCCESS.OK).send(`ClientID ${userID} created.`);
            } catch (error) {
                // Log any errors that occur during the insertion process and send a server error response
                console.error('Error inserting clientID:', error);
                res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send('Error inserting clientID.');
            }
        }
    } catch (error) {
        // Log any errors that occur during the user check and send a server error response
        console.error('Error checking clientID:', error);
        res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send('Error checking clientID.');
    }

    // Log the final status of the response
    console.log('-----\nSENT:\nOK\n----------------\n')
    // Send a final OK response
    res.status(statusCodes.SUCCESS.OK).send();
};

module.exports = { checkUser };


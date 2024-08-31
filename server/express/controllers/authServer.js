// Import helper functions and constants
const { statusCodes, getPeopleObject } = require('../../bin/services/helperFile');
const checkUser = require('../../bin/services/checkUser');

/**
 * Handles authentication and user management.
 * This function receives an access token, verifies its validity, and checks or updates the user in the database.
 *
 * @param {Object} req - The request object from Express, containing the HTTP request data.
 * @param {Object} res - The response object from Express, used to send the HTTP response.
 *
 * @throws {Error} If an error occurs while checking the user, a 500 Internal Server Error response is sent.
 *
 * @author jhwisnie
 */
const authServer = async (req, res) => {
    // Extract the token from the request body
    const token = req.body.token;

    // Log the received token for debugging purposes
    console.log(`\n----------------\nRECEIVED: ${JSON.stringify(token)}\n-----\n`);

    // Check if the token is provided
    if (!token) {
        // Log the error and send a response indicating the token is missing
        console.error('No access token provided.');
        return res.status(statusCodes.BAD_REQUEST).send('Invalid access token.');
    }

    try {
        // Use the token to retrieve user information from the Google People API
        const userID = await getPeopleObject(token);

        // Check for user existence in the database and update if necessary
        await checkUser(userID);
        
        // Log a message indicating that the user was processed and the next steps will be handled
        console.log('We got the user in the database and then will proceed to grab email');
        
        // Send a successful response indicating the user was processed correctly
        console.log('-----\nSENT:\nOK\n----------------\n');
        res.status(statusCodes.SUCCESS.OK).send();
    } catch (error) {
        // Log the error and send a response indicating a server error occurred
        console.error('Error checking user:', error);
        res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send('Error checking user');
    }
}

module.exports = { authServer };


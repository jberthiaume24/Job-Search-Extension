const { statusCodes, getGmailObject, getPeopleObject } = require('../../bin/services/helperFile');
const checkUser = require('../../bin/assets/checkUser.js');

/**
 * Fetches email details from Gmail and updates the user's email data.
 *
 * This function performs the following operations:
 * 1. Verifies the access token and retrieves Gmail and user information.
 * 2. Checks if the user exists in the system.
 * 3. Fetches emails from Gmail using the provided access token and limit.
 * 4. Sends appropriate responses based on success or failure of operations.
 *
 * @param {string} ACCESS_TOKEN - The access token for Gmail API authorization.
 * @param {Object} GMAIL - The Gmail API client object.
 * @param {number} LIMIT - The maximum number of emails to retrieve.
 * @returns {Promise<string|void>} A promise that resolves to a string message on error or `undefined` on success.
 *
 * @private
 */
async function fetchEmails(ACCESS_TOKEN, GMAIL, LIMIT) {
    if (!ACCESS_TOKEN) {
        console.error('No access token provided.');
        return 'Invalid access token.';
    }

    try {
        // Fetch the list of email messages from Gmail
        const response = await GMAIL.users.messages.list({
            userId: 'me',
            maxResults: LIMIT
        });

        const messages = response.data.messages;

        if (!messages || messages.length === 0) {
            return 'No emails found.';
        }

        // Fetch details for each email
        const emailDetailsPromises = messages.map(async (message) => {
            return GMAIL.users.messages.get({
                userId: 'me',
                id: message.id,
            }).then(emailResponse => emailResponse.data);
        });

        const emailDetails = await Promise.all(emailDetailsPromises);
        console.log('Fetched email details:', emailDetails);
    } catch (error) {
        console.error('Error fetching emails:', error.message);
        return 'Error fetching emails: ' + error.message;
    }
}

/**
 * Updates the user's email data based on the provided access token and limit.
 *
 * This function performs the following operations:
 * 1. Retrieves Gmail client and user ID using the provided token.
 * 2. Checks if the user exists in the system.
 * 3. Fetches emails from Gmail and processes them.
 * 4. Sends an appropriate response based on the success or failure of the operations.
 *
 * @param {Object} req - The request object from Express, containing the HTTP request data.
 * @param {Object} res - The response object from Express, used to send the HTTP response.
 *
 * @author jhwsinie
 */
const updateEmail = async (req, res) => {
    const token = req.body.token;
    const limit = req.body.limit;

    console.log(`\n----------------\nRECEIVED: ${JSON.stringify(token)} ${limit}\n-----\n`);

    try {
        // Retrieve Gmail client and user ID from the provided token
        const gmail = getGmailObject(token);
        const userID = await getPeopleObject(token);
    } catch (error) {
        res.status(statusCodes.CLIENT_ERROR.BAD_REQUEST).send('Invalid token');
        return; // Exit after sending a response
    }

    try {
        // Check if the user exists in the system
        await checkUser(userID);
    } catch (error) {
        res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send('Error checking user');
        return; // Exit after sending a response
    }

    // Fetch and process emails
    const message = await fetchEmails(token, gmail, limit);
    if (message) {
        res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send(message);
        return; // Exit after sending a response
    }

    // Send successful response
    console.log('-----\nSENT:\nOK\n----------------\n');
    res.status(statusCodes.SUCCESS.OK).send();
};

module.exports = { updateEmail };


const { statusCodes } = require('../../bin/services/helperFile');
const db = require('../../knex/db');

/**
 * Handles the insertion of application data into the database.
 *
 * This function performs the following operations:
 * 1. Receives a userId and application data from the request body.
 * 2. Splits and trims the application data from a comma-separated string.
 * 3. Checks if the user exists in the 'users' table.
 * 4. If the user exists, inserts the application data into the 'applications' table.
 * 5. Sends an appropriate response based on the success or failure of the operations.
 *
 * @param {Object} req - The request object from Express, containing the HTTP request data.
 * @param {Object} res - The response object from Express, used to send the HTTP response.
 *
 * @author jhwsinie
 */
const insertData = async (req, res) => {
    const userID = req.body.userId;
    const user_application = req.body.message;

    console.log(`\n----------------\nRECEIVED: ${userID}, ${JSON.stringify(user_application)}\n-----\n`);

    // Split the application data by comma and trim whitespace from each part
    const parts = user_application.split(',').map(part => part.trim());
    console.log(parts);

    // Check for user existence in the 'users' table
    try {
        const userExists = await db('users').where({ clientID: userID }).first();

        if (!userExists) {
            const errorMessage = `Invalid userID: ${userID}`;
            console.error('-----\nError: ', errorMessage, '\n----------------\n');
            res.status(statusCodes.CLIENT_ERROR.BAD_REQUEST).send(errorMessage);
            return;
        }
    } catch (error) {
        const errorMessage = `Failed to check user existence`;
        console.error('-----\nError checking userID:', error, '\n----------------\n');
        res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send(errorMessage);
        return;
    }

    // Insert the application data into the 'applications' table
    try {
        await db('applications').insert({
            clientID: userID,
            company: parts[0],
            position: parts[1],
            interview_type: parts[2],
            previous_interview: parts[3],
            result: parts[4],
            interviewers: parts[5],
            submission_date: parts[6],
            recent_date: parts[7]
        });
    } catch (error) {
        const errorMessage = `Failed to insert data`;
        console.error('-----\nError:', error, '\n----------------\n');
        res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send(errorMessage);
        return;
    }

    console.log("Applications successfully inserted");
    console.log();

    // Send a successful response
    console.log('-----\nSENT:\nOK\n----------------\n');
    res.status(statusCodes.SUCCESS.OK).send();
};

module.exports = { insertData };


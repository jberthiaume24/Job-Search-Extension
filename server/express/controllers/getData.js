const { statusCodes } = require('../../bin/services/helperFile');
const db = require('../../knex/db');

/**
 * Retrieves data related to a user from the database and sends it as a response.
 *
 * This function performs the following operations:
 * 1. Receives a userID from the request body.
 * 2. Queries the 'statistics' table for statistics related to the user.
 * 3. Queries the 'apps_by_result' table for application results related to the user.
 * 4. Constructs a response object containing statistics and application results.
 * 5. Sends the constructed data as a JSON response with a success status.
 *
 * @param {Object} req - The request object from Express, containing the HTTP request data.
 * @param {Object} res - The response object from Express, used to send the HTTP response.
 *
 * @author jhwsinie
 */
const getData = async (req, res) => {
    const userID = req.body.userID;

    console.log(`\n----------------\nRECEIVED: ${userID}\n-----\n`);

    try {
        // Query for user statistics from the 'statistics' table
        const stats_entry = await db('statistics').where({ clientID: userID }).first();

        if (!stats_entry) {
            console.error('No statistics found for this userID.');
            return res.status(statusCodes.CLIENT_ERROR.NOT_FOUND).send('User statistics not found.');
        }

        const stats = {
            "total_apps": stats_entry.total_apps,
            "total_pending_apps": stats_entry.total_pending_apps,
            "pass_rate": stats_entry.pass_rate
        };

        // Query for application results from the 'apps_by_result' table
        const result_entry = await db('apps_by_result').where({ clientID: userID }).first();

        if (!result_entry) {
            console.error('No application results found for this userID.');
            return res.status(statusCodes.CLIENT_ERROR.NOT_FOUND).send('User application results not found.');
        }

        const apps_by_result = JSON.parse(result_entry['apps_by_company']);

        // Construct the data object to be sent in the response
        const data = {
            "apps_by_results": apps_by_result,
            "statistics": stats
        };

        console.log("Statistics and Apps by Result retrieved.");
        console.log();

        // Send the response with the constructed data
        console.log('-----\nSENT:\nOK\n----------------\n');
        res.status(statusCodes.SUCCESS.OK).json(data);
    } catch (error) {
        console.error('Error retrieving user data:', error.message);
        res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send('Error retrieving user data.');
    }
};

module.exports = { getData };


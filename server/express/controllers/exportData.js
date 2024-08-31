// Import necessary modules and constants
const { statusCodes } = require('../../bin/services/helperFile');
const db = require('../../knex/db');

/**
 * Converts a JSON array to CSV format.
 * 
 * @param {Array<Object>} jsonData - The JSON data to be converted to CSV. Each object represents a row.
 * @returns {string} The CSV representation of the JSON data. If the input is empty, returns an empty string.
 */
function jsonToCsv(jsonData) {
    if (jsonData.length === 0) {
        return '';
    }

    // Extract headers from the first object
    const headers = Object.keys(jsonData[0]);
    console.log(`Data headers:\n${headers}\n`);

    // Extract rows and convert each value to a CSV-compatible format
    const rows = jsonData.map(obj =>
        headers.map(header => {
            const value = obj[header];
            if (Array.isArray(value)) {
                return `"${value.join(', ')}"`; // Handle arrays
            }
            return `"${value}"`; // Handle strings and other values
        })
    );

    // Combine headers and rows to create CSV content
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    console.log(`CSV Content:\n${csvContent}\n`);
    return csvContent;
}

/**
 * Handles the export of data for the `exportDB` route.
 * Retrieves user applications based on the provided clientID, converts the data to CSV format, and returns it.
 * 
 * @param {Object} req - The request object from Express, containing the HTTP request data.
 * @param {Object} res - The response object from Express, used to send the HTTP response.
 * 
 * @author jhwsinie
 */
const exportData = async (req, res) => {
    // Extract user clientID from the request body
    const user_clientID = req.body.value;

    // Log the received clientID for debugging purposes
    console.log(`\n----------------\nRECEIVED:\n${user_clientID}\n----------------\n`);

    try {
        // Fetch user information based on the provided clientID
        const user = await db('users').where({ clientID: user_clientID }).first();

        if (user) {
            try {
                // Fetch all applications associated with the provided clientID
                const applications_jsonData = await db('applications')
                    .select('*')
                    .where({ clientID: user_clientID });

                if (applications_jsonData.length === 0) {
                    // If no applications are found, log and send a no content response
                    console.log('No applications found for this clientID.');
                    res.status(statusCodes.SUCCESS.NO_CONTENT).send('No applications found for this clientID.');
                    return;
                }

                // Convert the applications data to CSV format
                const message = jsonToCsv(applications_jsonData);

                // Send the CSV data in the response
                console.log('Data successfully exported.');
                res.status(statusCodes.SUCCESS.OK).send(JSON.stringify({ value: message }));
            } catch (error) {
                // Log any errors during the data retrieval and send a server error response
                console.error('Error grabbing user applications:', error);
                res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send('Error fetching user applications.');
            }
        } else {
            // If no user is found, log and send a not found response
            const message = 'No user data found';
            console.log(`-----\nSENT:\n${message}\n----------------\n`);
            res.status(statusCodes.CLIENT_ERROR.NOT_FOUND).send(message);
        }
    } catch (error) {
        // Log any errors during the user lookup and send a server error response
        console.error('Error looking up clientID in users table:', error);
        res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send('Error looking up clientID.');
    }

    // Final log and response
    console.log('-----\nSENT:\nOK\n----------------\n');
    res.status(statusCodes.SUCCESS.OK).send();
};

module.exports = { exportData };


const { statusCodes, getGmailObject, getPeopleObject } = require('../../bin/services/helperFile');

/**
 * Subtracts one day from a given date.
 *
 * @param {Date} date - The original date to subtract from.
 * @returns {Date} A new Date object representing one day before the input date.
 */
function subtractOneDay(date) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    return newDate;
}

/**
 * Formats a date into 'YYYY/MM/DD' format.
 *
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

/**
 * Fetches emails from Gmail API after a specific date.
 *
 * @param {Object} GMAIL - The Gmail API client object.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of email details.
 */
async function getEmails(GMAIL) {
    try {
        const today = new Date();
        const yesterday = subtractOneDay(today);
        const formattedDate = getFormattedDate(yesterday);

        const response = await GMAIL.users.messages.list({
            userId: 'me',
            q: `after:${formattedDate}`
        });

        const messages = response.data.messages;
        if (!messages || messages.length === 0) {
            console.log('No emails found.');
            return [];
        }

        // Fetch details for each email message
        const emailDetailsPromises = messages.map(async (message) => {
            return GMAIL.users.messages.get({
                userId: 'me',
                id: message.id,
            }).then(emailResponse => emailResponse.data);
        });

        const emailDetails = await Promise.all(emailDetailsPromises);
        console.log('Fetched email details:', emailDetails);
        
        return emailDetails;
    } catch (error) {
        console.error('Error fetching emails:', error.message);
        return [];
    }
}

/**
 * Cleans up the email body by removing URLs, HTML tags, and unwanted characters.
 *
 * @param {string} body - The raw email body to clean.
 * @returns {string} The cleaned email body.
 */
function cleanEmailBody(body) {
    return body
      .replace(new RegExp('http[s]?:\\/\\/.+', 'g'), '') // Remove URLs
      .replace(new RegExp('<[^>]+>', 'g'), '') // Remove HTML tags
      .replace(new RegExp('&lt;', 'g'), '<') // Convert HTML entities to characters
      .replace(new RegExp('&gt;', 'g'), '>') // Convert HTML entities to characters
      .replace(new RegExp('&amp;', 'g'), '&') // Convert HTML entities to characters
      .replace(new RegExp('&#39;', 'g'), `'`) // Convert HTML entities to characters
      .replace(new RegExp('[^\\x00-\\x7F]', 'g'), '') // Remove non-ASCII characters
      .replace(new RegExp('[\\u2018\\u2019\\u201C\\u201D]', 'g'), `'`) // Replace curly quotes with straight quotes
      .replace(new RegExp('\\s+', 'g'), ' ') // Replace multiple whitespace characters with a single space
      .replace(new RegExp('\\r\\n|\\r|\\n', 'g'), ' ') // Replace newline characters with a single space
      .replace(new RegExp('[()]+', 'g'), '') // Remove parentheses
      .trim(); // Remove leading and trailing whitespace
}

/**
 * Extracts and cleans the email body from the payload.
 *
 * @param {Object} payload - The email payload object from Gmail API.
 * @returns {string} The cleaned email body.
 */
const extractBody = (payload) => {
    let body = '';

    if (payload.parts) {
        for (const part of payload.parts) {
            if (part.mimeType === 'text/plain') {
                body += Buffer.from(part.body.data, 'base64').toString('utf8');
            } else if (part.mimeType === 'multipart/alternative' && part.parts) {
                for (const subPart of part.parts) {
                    if (subPart.mimeType === 'text/plain') {
                        body += Buffer.from(subPart.body.data, 'base64').toString('utf8');
                    }
                }
            }
        }
    } else if (payload.body) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf8');
    }

    return cleanEmailBody(body);
};

/**
 * Fetches emails using Gmail API, formats them, and sends the data to an external route.
 *
 * @param {Object} req - The request object from Express, containing the HTTP request data.
 * @param {Object} res - The response object from Express, used to send the HTTP response.
 *
 * @author jhwsinie
 */
const fetchEmail = async (req, res) => {
    const token = req.body.token;
    const userID = await getPeopleObject(token); // Replace with actual userID from your context

    console.log(`\n----------------\nRECEIVED: Token:${JSON.stringify(token)}\nUser ID: ${userID}\n-----\n`);

    try {
        const gmail = getGmailObject(token);
        const emailDetails = await getEmails(gmail);

        if (emailDetails.length === 0) {
            console.log('No emails to process.');
            res.status(statusCodes.SUCCESS.OK).send();
            return;
        }

        // Initialize the formattedEmails object
        const formattedEmails = {};

        // Map email details to the desired JSON format
        for (const email of emailDetails) {
            const headers = email.payload.headers.reduce((headerAcc, header) => {
                headerAcc[header.name.toLowerCase()] = header.value;
                return headerAcc;
            }, {});

            const body = extractBody(email.payload);

            formattedEmails[email.id] = {
                "To": headers.to || 'No recipient',
                "From": headers.from || 'No sender',
                "Message": body || 'No body'
            };
        }

        // console.log('Formatted Emails:', JSON.stringify(formattedEmails, null, 2));

        // Send the formatted emails to an external route
        await fetch('http://localhost:3000/email-route', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify({ 
                emails: formattedEmails,
                userId: userID
            }),
        });

        console.log('We have fetched emails and sent them off to the proper route to pass them into GPT filter');

        console.log('-----\nSENT:\nOK\n----------------\n');
        res.status(statusCodes.SUCCESS.OK).send();
    } catch (error) {
        console.error('Error processing emails:', error.message);
        res.status(statusCodes.SERVER_ERROR.INTERNAL_ERROR).send('Error processing emails');
    }
};

module.exports = { fetchEmail };


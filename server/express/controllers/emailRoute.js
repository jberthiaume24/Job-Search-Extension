/**
 * File Name: email-route.js
 * Application Route: https://careeroptiwise.com/receive-emails
 *
 * Receives: JSON of emails in the form of:
 * {
 *   EmailID: { To: Person, From: Person, Message: Body },
 *   EmailID2: { .... }
 * }
 *
 * Purpose: Sends the body of the email to the ChatGPT API to scrub for information.
 * Information is then pushed to the database.
 *
 * Author: jberthia
 * Created: 2024-07-29
 * Last Modified: 2024-07-30
 * Last Modified By: jberthia
 **/

const OpenAI = require('openai'); // Import OpenAI library to interact with the ChatGPT API
const { statusCodes } = require('../../bin/services/helperFile'); // Import status codes for response handling

// Define sets of relevant and non-relevant words for scoring
const ApplicationWords = new Set([
    'application', 'interview', 'offer', 'position', 'candidate',
    'resume', 'skills', 'company', 'feedback', 'process'
]);

const NonRelevantWords = new Set([
    'advertisement', 'promotion', 'newsletter', 'spam', 'solicitation'
]);

// Define points for each word category
const RELEVANT_WORD_POINTS = 1; // Points added for relevant words
const NON_RELEVANT_WORD_POINTS = -1; // Points subtracted for non-relevant words

// Initialize OpenAI with the API key
const openai = new OpenAI(
    { apiKey: require('../../bin/config/openai_API_key.json').secret_key }
);

/**
 * Sends the email body to the ChatGPT API for processing.
 * Uses prompt engineering to extract specific information from the email body.
 * 
 * @param {string} messageContent - The content of the email message to be processed.
 * @returns {Promise<string>} The response from the ChatGPT API with the processed information.
 */
async function getChatCompletion(messageContent) {
    try {
        // Construct the prompt with the email content for ChatGPT
        const prompt = `Please respond only with one line, comma separated answers.
        Skim this email, and give me the information in this order:
        company, position (if there is a comma in this field, omit it), interview type, previous interview, result of the interview,
        interviewer(s), submission date, and recent date. If there are any missing fields,
        please fill with (empty). For any date, please format in the form of MM-DD-YYYY: ${messageContent}`;

        // Call the ChatGPT API to get the completion
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-3.5-turbo',
        });

        // Extract the response message from the API's choice
        const responseMessage = chatCompletion.choices[0].message.content;
        return responseMessage;
    } catch (error) {
        console.error('Error getting response from OpenAI:', error.message);
        throw error; // Re-throw the error after logging it
    }
}

/**
 * Calculates the relevance score of an email body based on the presence of defined words.
 * 
 * @param {string} emailBody - The content of the email to be scored.
 * @returns {number} The calculated score based on the relevance of words.
 */
function calculateScore(emailBody) {
    // Initialize score
    let score = 0;

    // Normalize the email body to lowercase and split into words
    const words = emailBody.toLowerCase().split(/\s+/);

    // Iterate over words and calculate the score
    for (const word of words) {
        if (ApplicationWords.has(word)) {
            score += RELEVANT_WORD_POINTS;
        } else if (NonRelevantWords.has(word)) {
            score += NON_RELEVANT_WORD_POINTS;
        }
    }

    return score;
}

/**
 * Handles the route for receiving email JSON payload, processing it, and interacting with the ChatGPT API.
 * 
 * @param {Object} req - The request object containing email data and userId.
 * @param {Object} res - The response object used to send a response to the client.
 */
const emailRoute = async (req, res) => {
    try {
        // Extract the JSON data from the request body
        const emailData = req.body.emails;
        const userID = req.body.userId;

        console.log(`\n----------------\nRECEIVED: Body: User ID: ${userID}\n-----\n`);

        // Ensure email data is valid
        if (!emailData) {
            return res.status(400).json({ message: 'Invalid email data format' });
        }

        // Initialize object to store processed emails
        const processedEmails = {};

        // Process each email entry
        for (const [id, email] of Object.entries(emailData)) {
            if (email.Message) {
                // Calculate the score for the email body
                const score = calculateScore(email.Message);

                // Store emails with a positive score
                if (score > 0) {
                    processedEmails[id] = email;
                    console.log(`Email ID ${id} scored ${score}`);
                    try {
                        // Get completion response from ChatGPT API
                        const response = await getChatCompletion(email.Message);
                        console.log(`Response from ChatGPT: ${response}`);

                        // Send the processed response to another service or endpoint
                        await fetch('http://localhost:3000/insert-data', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            mode: 'cors',
                            body: JSON.stringify({
                                userId: userID,
                                message: response
                             }),
                        });
                    } catch (error) {
                        console.error(`Failed to get response from ChatGPT for Email ID ${id}: ${error.message}`);
                    }
                }
            } else {
                console.log(`Skipping email entry with ID ${id} due to missing message.`);
            }
        }

        // Send a response to acknowledge successful processing
        console.log('Emails received and processed successfully');
        console.log('-----\nSENT:\nOK\n----------------\n');
        res.status(statusCodes.SUCCESS.OK).send();
    } catch (error) {
        console.error('Error processing emails:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { emailRoute };

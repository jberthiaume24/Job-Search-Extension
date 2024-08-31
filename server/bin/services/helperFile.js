const { google } = require('googleapis');

const statusCodes = {
    SUCCESS: {
        OK: 200,
        NO_CONTENT: 204,
    },
    CLIENT_ERROR: {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
    },
    SERVER_ERROR: {
        INTERNAL_ERROR: 500,
    },
    // Add more status codes as needed
}

const requiredFields = [
    'company',
    'position',
    'interview_type',
    'previous_interview',
    'result',
    'interviewers',
    'submission_date',
    'recent_date'
]

function getGmailObject(accessToken) {
    if (!accessToken) {
        throw new Error('Access token is required');
    }
    
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    return google.gmail({ version: 'v1', auth: oauth2Client });
}

async function getPeopleObject(accessToken) {
    if (!accessToken) {
        throw new Error('Access token is required');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const people = google.people({ version: 'v1', auth: oauth2Client });

    try {
        // Fetch user profile information
        const response = await people.people.get({
            resourceName: 'people/me',
            personFields: 'names,emailAddresses'
        });

        // Extract the resource name from the response
        const resourceName = response.data.resourceName;
        if (!resourceName) {
            throw new Error('No resource name found in the response');
        }

        // Extract the numeric user ID from the resource name
        const userID = resourceName.split('/')[1];

        return userID;
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        throw new Error('Failed to fetch user profile');
    }
}

module.exports = {
    statusCodes,
    requiredFields,
    getGmailObject,
    getPeopleObject
}

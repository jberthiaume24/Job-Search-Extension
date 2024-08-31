// import express
const express = require('express')

// 1. create express router
const router  = express.Router()

// 2. import controller
const connController = require('../controllers/applicationUpdate')

// 3. create route
router.put('/applicationUpdate', connController.applicationUpdate)

// 4.  export route for server.js
module.exports = router


function makeChangesDB(apps) {
    return { 'apps': 1 
        /* stats, potentially a list
            company:
            app to interview rate:
            inter to hire rate:
            overall app to hire rate:

            will pull from stats table
            -PostgreS query needed
        */
    }
}

// newUpdateDB function for post updateDB route
// if async, "const newUpdateDB = async ..."
//      - use await with the race condition function called
const applicationUpdate = (req, res) => {
    // postman testing
    sentData = req.body

    // log data received
    console.log(`\n----------------\nRECEIVED:\n${sentData}\n-----\n`)

    /*
    get clientID from sentData
    if clientID not in users
        insert them into users table
    else
        proceed with update
    */

    // async function type updateDB()
    // wait for updates to the DB before continuing, do not give up control
    //let message = await updateDB(sentData)
    
    // generic echo setup, not async
    //let message = sentData

    // test function
    let message = makeChangesDB(sentData)

    // log message for response
    console.log(`-----\nSENT:\n${message}\n----------------\n`)

    // send the message as a response
    res.json(message)
}

module.exports = {applicationUpdate}

// FOR LATER
async function insertData() {
    try {
      // Example: Inserting a user into the "users" table
      const result = await db('users').insert({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'johnsPass123!'
      }).returning('*');  // Return the inserted row(s)
  
      console.log('Inserted data:', result)
    } catch (error) {
      console.error('Error inserting data:', error)
    }
  }




  const { google } = require('googleapis');
const open = require('open');
const readline = require('readline');
const fs = require('fs');
const secret = require('/bin/secret/server_secret.json')

// Your OAuth2 client ID and secret from Google Cloud Console
const CLIENT_ID = secret.installed.client_id;
const CLIENT_SECRET = secret.installed.client_secret;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // For desktop apps

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generate the authorization URL
function getAuthUrl() {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.readonly'
      ]

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
}

// Authorize the user and get the authorization code
async function getAuthCode() {
    const authUrl = getAuthUrl();
    console.log('Authorize this app by visiting this url:', authUrl);
    open(authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question('Enter the authorization code: ', (code) => {
            rl.close();
            resolve(code);
        });
    });
}

// Exchange the authorization code for tokens
async function getTokens(authCode) {
    const { tokens } = await oauth2Client.getToken(authCode);
    oauth2Client.setCredentials(tokens);
    
    // Save tokens for future use
    fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
    console.log('Tokens saved to tokens.json');
    return tokens;
}

// Access Gmail and fetch emails
async function fetchEmail(userID) {
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        const res = await gmail.users.messages.list({
            userId: userID,
            q: `after:${formattedDate}`
        });
        console.log('Messages:', res.data);
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Main function to handle the process
async function main() {
    try {
        const authCode = await getAuthCode();
        const tokens = await getTokens(authCode);
        await fetchEmail(tokens.access_token);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}
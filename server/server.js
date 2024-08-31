// Import the Express framework, which is used to create the web server and manage routes
const express = require('express');
// Import the CORS middleware to handle Cross-Origin Resource Sharing
const cors = require('cors');

// Import route modules from the './express/routes' directory
const exportData = require('./express/routes/export-data');
const checkUser = require('./express/routes/check-user');
const insertData = require('./express/routes/insert-data');
const authServer = require('./express/routes/auth-server');
const fetchEmail = require('./express/routes/fetch-email');
const emailRoute = require('./express/routes/email-route');
const getData = require('./express/routes/get-data');

// Create an instance of an Express application
const app = express();

/**
 * Middleware to parse incoming JSON request bodies.
 * This is essential for handling JSON payloads in POST requests.
 */
app.use(express.json());

// Middleware to enable CORS for all routes. This allows the server to respond to requests from different origins.
// Useful for enabling client-side applications running on different domains to interact with this server.
app.use(cors());

/**
 * Register route handlers with the application.
 * The base URL for all routes is set to '/'.
 * Each route module is responsible for handling a specific set of endpoints.
 */

// Route for exporting data
app.use('/', exportData);

// Route for checking user credentials or information
app.use('/', checkUser);

// Route for inserting new data
app.use('/', insertData);

// Route for handling authentication and authorization
// This route uses the Gmail API to authenticate users and obtain OAuth tokens.
app.use('/', authServer);

// Route for fetching email-related information or operations
// This route uses the OAuth token obtained from the authServer route to fetch emails on behalf of the authenticated user.
app.use('/', fetchEmail);

// Route for handling email-related operations
app.use('/', emailRoute);

// Route for retrieving data
app.use('/', getData);

/**
 * Start the server and listen on a specified port.
 * If the PORT environment variable is set, use that value; otherwise, default to port 3000.
 * Logs a message to the console with the port number on which the server is listening.
 */
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port + '\n');
});


// Author: jhwisnie

/**
 * Function to handle sign-in with Google and update email.
 * - Retrieves an authentication token.
 * - Sends the token to the server for further processing.
 */
async function signInWithGoogle() {
  try {
    // Get the authentication token from Chrome Identity API
    const token = await getAuthToken();
    console.log(`Received token from getAuthToken(): ${token}`);
    
    // Send the token to the server to update the email
    await authServer(token);
  } catch (error) {
    console.error(`Error during sign-in: ${error}`);
  }
}

/**
 * Helper function to get an authentication token from Chrome Identity API.
 * - Uses Chrome's identity.getAuthToken method to request an OAuth2 token.
 * @returns {Promise<string>} - A promise that resolves to the authentication token.
 */
function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        // Reject if there is an error obtaining the token
        return reject(chrome.runtime.lastError.message);
      }
      resolve(token);
    });
  });
}

/**
 * Helper function to update email on the server with the provided token.
 * - Sends the token to the server's authentication endpoint.
 * @param {string} token - The OAuth2 token obtained from the Chrome Identity API.
 */
async function authServer(token) {
    try {
        const response = await fetch('https://careeroptiwise.com/auth-server', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({
            token: token
          }),
        });

        // Log the response from the server
        console.log(`Server response: ${response.status} ${await response.text()}`);
        
        // Fetch emails after updating server
        await fetchEmail(token);
    } catch (error) {
        console.error(`Error updating server: ${error}`);
    }
}

/**
 * Helper function to fetch emails from the server with the provided token.
 * - Sends the token to the server's email fetch endpoint.
 * @param {string} token - The OAuth2 token obtained from the Chrome Identity API.
 */
async function fetchEmail(token) {
    try {
        const response = await fetch('https://careeroptiwise.com/fetch-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({
            token: token
          }),
        });

        // Log the response from the server
        console.log(`Server response: ${response.status} ${await response.text()}`);
    } catch (error) {
        console.error(`Error fetching email: ${error}`);
    }
}

// Initial sign-in
signInWithGoogle();


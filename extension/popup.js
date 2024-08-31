// Author: Mihir Patel

/**
 * Function to populate the table with test data.
 * - Updates the statistics section with data.
 * - Fills the company applications table with data.
 * @param {Object} data - The data object containing statistics and applications by results.
 */
function populateTables(data) {
  // Get references to DOM elements where data will be inserted
  const totalApplications = document.getElementById('totalApplications');
  const totalPendingApplications = document.getElementById('totalPendingApplications');
  const passingRate = document.getElementById('passingRate');
  const failureRate = document.getElementById('failureRate');
  
  // Populate statistics section
  totalApplications.textContent = data.statistics.total_apps;
  totalPendingApplications.textContent = data.statistics.total_pending_apps;
  passingRate.textContent = (data.statistics.pass_rate * 100).toFixed(2) + '%';
  failureRate.textContent = (100 - data.statistics.pass_rate * 100).toFixed(2) + '%';
  
  // Get reference to the company table body and clear existing rows
  const companyTableBody = document.querySelector('#companyTable tbody');
  companyTableBody.innerHTML = '';

  // Populate company applications table
  for (const [company, stats] of Object.entries(data.apps_by_results)) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${company}</td>
      <td>${stats.total}</td>
      <td>${stats.passed_total}</td>
      <td>${stats.failed}</td>
      <td>${stats.pending_total}</td>
    `;
    companyTableBody.appendChild(row);
  }
}

/**
 * Function to toggle between the statistics and company applications table views.
 */
function toggleTableView() {
  // Get references to the table view sections
  const statsView = document.getElementById('statsView');
  const companyView = document.getElementById('companyView');
  
  // Toggle visibility between stats view and company view
  if (statsView.style.display === 'none') {
    statsView.style.display = 'block';
    companyView.style.display = 'none';
  } else {
    statsView.style.display = 'none';
    companyView.style.display = 'block';
  }
}

// Event listener for DOMContentLoaded to ensure the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Get reference to the toggle button and attach the click event listener
  const toggleButton = document.getElementById('toggleButton');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleTableView);
  }

  // Fetch data from the backend and populate tables
  (async () => {
    try {
      const response = await fetch('httpa://careeroptiwise.com/get-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          userID: 'XyZ123' // Hardcoded value for Proof of Concept
        })
      });

      const data = await response.json();
      populateTables(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  })();
});

// Event listener for the download CSV button
document.getElementById('downloadCsvBtn').addEventListener('click', function() {
  // Function to convert table data to CSV format
  function tableToCSV(table) {
    let csv = [];
    let rows = table.querySelectorAll('tr');
    
    for (let i = 0; i < rows.length; i++) {
      let row = [], cols = rows[i].querySelectorAll('td, th');
      
      for (let j = 0; j < cols.length; j++) {
        // Sanitize data by wrapping it with double quotes and escaping any existing double quotes
        row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
      }   
      csv.push(row.join(','));        
    }
    return csv.join('\n');
  }

  // Get references to the summary and company tables
  let summaryTable = document.getElementById('summaryTable');
  let companyTable = document.getElementById('companyTable');

  // Create CSV content for both tables
  let csvContent = 'Summary Data\n';
  csvContent += tableToCSV(summaryTable);
  csvContent += '\n\nCompany Applications Data\n';
  csvContent += tableToCSV(companyTable);

  // Create a Blob for the CSV content
  let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a download link for the CSV file
  let link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'application_data.csv';

  // Append the link to the document, trigger a click to download, then remove the link
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

/*
Commented implementation of fetchEmails (feature was dropped)

let ACCESS_TOKEN;

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("fetchEmails")
    .addEventListener("click", fetchAndDisplayEmails);
});

chrome.identity.getAuthToken({ interactive: true }, function (token) {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError.message);
    return;
  }
  ACCESS_TOKEN = token;
});

function fetchAndDisplayEmails() {
  fetch("https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=5", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Messages Response:", data); // Log the messages response
      const emails = data.messages || [];

      if (emails.length === 0) {
        console.log("No emails found in messages response.");
        displayNoEmailsMessage();
        return;
      }

      const fetchEmailDetailsPromises = emails.map((email) => {
        return fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${email.id}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + ACCESS_TOKEN,
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => response.json())
          .then((detailedEmailData) => {
            console.log("Detailed Email Data:", detailedEmailData); // Log detailed email data
            const detailedEmail = {
              id: email.id,
              sender: detailedEmailData.payload.headers.find(
                (header) => header.name === "From"
              ).value,
              date: new Date(
                parseInt(detailedEmailData.internalDate)
              ).toUTCString(),
              snippet: detailedEmailData.snippet,
              // Add more fields as needed
            };
            return detailedEmail;
          })
          .catch((error) =>
            console.error("Error fetching detailed email:", error)
          );
      });

      Promise.all(fetchEmailDetailsPromises).then((emailDetails) => {
        console.log("All email details fetched:", emailDetails);
        displayEmails(emailDetails);
      });
    })
    .catch((error) => console.error("Error fetching emails:", error));
}

function displayEmails(emails) {
  const emailsContainer = document.getElementById("emailsContainer");
  emailsContainer.innerHTML = ""; // Clear previous content

  emails.forEach((email) => {
    const emailElement = document.createElement("div");
    emailElement.classList.add("email");

    const senderElement = document.createElement("p");
    senderElement.innerText = "From: " + email.sender;

    const dateElement = document.createElement("p");
    dateElement.innerText = "Date: " + email.date;

    const snippetElement = document.createElement("p");
    snippetElement.innerText = "Snippet: " + email.snippet;

    emailElement.appendChild(senderElement);
    emailElement.appendChild(dateElement);
    emailElement.appendChild(snippetElement);

    emailsContainer.appendChild(emailElement);
  });
}

function displayNoEmailsMessage() {
  const emailsContainer = document.getElementById("emailsContainer");
  emailsContainer.innerHTML = "<p>No emails found.</p>";
}
*/
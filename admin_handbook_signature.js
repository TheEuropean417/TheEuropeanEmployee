let employees = [];

// Trigger the fetch of Square Employees when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("Triggering fetchSquareEmployees...");

    fetch('https://us-central1-the-european.cloudfunctions.net/corsProxy?url=https://script.google.com/macros/s/AKfycbzMK0Jardx4ivA8N_HmOwUQnALkjXda1eheZEH3dFOZPoLz52kJy2JahoxkGlzmp3VMdw/exec?action=fetchSquareEmployees', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.text())
    .then(data => {
        console.log('Response from fetchSquareEmployees:', data);
        try {
            const jsonData = JSON.parse(data);
            if (jsonData.success) {
                fetchEmployeeData();  // Proceed to fetch updated employee data
            } else {
                document.getElementById('login-status').innerText = 'Error fetching employee data.';
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
            document.getElementById('login-status').innerText = 'Invalid response format.';
        }
    })
    .catch(error => {
        console.error('Error triggering employee data fetch:', error);
        document.getElementById('login-status').innerText = 'Error triggering employee data fetch.';
    });
});

// Fetch updated employee data from the Google Sheet
function fetchEmployeeData() {
    console.log("Fetching employee data from Google Sheet...");

    fetch('https://us-central1-the-european.cloudfunctions.net/corsProxy?url=https://script.google.com/macros/s/AKfycbzMK0Jardx4ivA8N_HmOwUQnALkjXda1eheZEH3dFOZPoLz52kJy2JahoxkGlzmp3VMdw/exec?action=getEmployeeData', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.text())
    .then(data => {
        try {
            const jsonData = JSON.parse(data);
            console.log('Parsed employee data:', jsonData);
            if (jsonData.success) {
                employees = jsonData.employees;
                document.getElementById('login-status').innerText = 'Please enter your credentials.';
                document.getElementById('login-status').style.color = 'green';
                document.querySelector('.btn').disabled = false;  // Enable login button
            } else {
                document.getElementById('login-status').innerText = 'Error loading employee data.';
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
            document.getElementById('login-status').innerText = 'Invalid response format.';
        }
    })
    .catch(error => {
        console.error('Error fetching employee data:', error);
        document.getElementById('login-status').innerText = 'Error fetching employee data.';
    });
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.toLowerCase().trim();  // Normalize name input
    const password = document.getElementById('password').value.trim();  // Normalize password input

    // Allowed users: Uliana Komodi and Khrystyna Savva
    const allowedUsers = ["uliana komodi", "khrystyna savva"];

    // Check if the entered name matches one of the allowed users
    const employee = employees.find(emp =>
        allowedUsers.includes(name) && emp.firstName.toLowerCase() + ' ' + emp.lastName.toLowerCase() === name && emp.employeeId === password
    );

    if (employee) {
        document.getElementById('login-status').innerText = 'Successful login!';
        document.getElementById('login-status').style.color = 'green';

        // Hide the login form
        document.getElementById('loginForm').style.display = 'none';

        // Trigger the Google Apps Script after successful login
        runGoogleScript();
    } else {
        document.getElementById('login-status').style.color = 'red';
        document.getElementById('login-status').innerText = 'INCORRECT USER NAME OR PASSWORD';
    }
});

// Function to trigger Google Apps Script after successful login
function runGoogleScript() {
    fetch('https://us-central1-the-european.cloudfunctions.net/CorsProxy_Adminsignaturedatabase?url=https://script.google.com/macros/s/AKfycby4yIz6BXBym2QjoXvUJFt821ZYaqj-BHQKmZ35_gMJQ3zIA8xbWBZN5G9ZyNJK2yYCwQ/exec', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text(); // We use text to handle both JSON and non-JSON responses
    })
    .then(data => {
        try {
            const jsonData = JSON.parse(data); // Attempt to parse JSON
            if (jsonData.success) {
                console.log("Google Apps Script executed successfully.");
                // Optionally, take further actions here
            } else {
                console.error("Google Apps Script execution failed:", jsonData.message);
            }
        } catch (error) {
            // If it's not valid JSON, we log the raw response for debugging
            console.error("Response is not valid JSON:", data);
        }
    })
    .catch(error => {
        console.error("Error triggering Google Apps Script:", error);
    });
}


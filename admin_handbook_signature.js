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

        // Display success message inside the form container
        // const successMessage = document.createElement('div');
        // successMessage.innerHTML = "<h2>Welcome, you have successfully logged in!</h2>";
        // successMessage.style.color = "green";
        // document.querySelector('.form-container').appendChild(successMessage);

    } else {
        document.getElementById('login-status').style.color = 'red';
        document.getElementById('login-status').innerText = 'INCORRECT USER NAME OR PASSWORD';
    }
});
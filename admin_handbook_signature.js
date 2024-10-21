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

        // Load and display the employee handbook data
        loadEmployeeHandbookData();
    } else {
        document.getElementById('login-status').style.color = 'red';
        document.getElementById('login-status').innerText = 'INCORRECT USER NAME OR PASSWORD';
    }
});

// Function to load employee handbook data from the specified Google Sheet
function loadEmployeeHandbookData() {
    const sheetID = '1IQuJehvj16Pi1toOxuNoNZmLf_yKNFnBtdwEZhuClvQ';
    const sheetName = 'Employee_Handbook_Sign';
    
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Clean up the response to make it parsable as JSON
            const jsonData = JSON.parse(data.substring(47).slice(0, -2)); // Google Sheets returns wrapped JSON
            const rows = jsonData.table.rows;

            // Clear any previous content in the form container
            const formContainer = document.querySelector('.form-container');
            formContainer.innerHTML = '';

            // Create a table dynamically to display the sheet data
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';

            // Add rows from the sheet data
            rows.forEach(row => {
                const tableRow = document.createElement('tr');
                row.c.forEach(cell => {
                    const tableCell = document.createElement('td');
                    tableCell.style.border = '1px solid #ddd';
                    tableCell.style.padding = '8px';
                    tableCell.textContent = cell ? cell.v : ''; // Display cell value, or empty string if null
                    tableRow.appendChild(tableCell);
                });
                table.appendChild(tableRow);
            });

            // Add the table to the form container
            formContainer.appendChild(table);
        })
        .catch(error => {
            console.error('Error fetching or displaying employee handbook data:', error);
            document.getElementById('login-status').innerText = 'Error loading employee handbook data.';
        });
}

const { google } = require('googleapis');
const express = require('express');
const app = express();
const PORT = 3000;

const privateKey = `-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhki...END PRIVATE KEY-----\n`; // Replace with your private key
const clientEmail = 'the-european-service-account@the-european.iam.gserviceaccount.com'; // Replace with your service account email
const spreadsheetId = '1IQuJehvj16Pi1toOxuNoNZmLf_yKNFnBtdwEZhuClvQ';
const sheetName = 'Employee_Handbook_Sign';

const oauth2Client = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getSheetData() {
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });

  return response.data.values;
}

app.get('/employees', async (req, res) => {
  try {
    const rows = await getSheetData();

    // You can filter the data based on E and F columns
    const employeesWithoutSignatures = rows.filter((row) => row[4] && row[5]);
    const employeesWithSignatures = rows.filter((row) => !row[4] || !row[5]);

    res.json({ withoutSignatures: employeesWithoutSignatures, withSignatures: employeesWithSignatures });
  } catch (error) {
    console.error('Error fetching data', error);
    res.status(500).send('Error fetching data from Google Sheets');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

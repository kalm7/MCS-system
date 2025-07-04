const { google } = require('googleapis');
const path = require('path');

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return await auth.getClient();
}

async function downloadSheet() {
  const authClient = await authorize();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const spreadsheetId = '1hRMDZ0A9NL5kEhXCeBQuQEt_Qgv2yLvpl73NLzhFIHM';
  const range = 'Sheet1';
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  console.log(res.data.values);
}

downloadSheet().catch(err => console.error('Error downloading sheet:', err));

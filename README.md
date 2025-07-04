# MCS-system
Formulario app web, diseñado para funcionar como sistema de registro de información del call center de telemedicina llamado Módulo Conectando Salud, ubicado en La Tinta, A. V.

## Node script for downloading data

The `app.js` file uses the Google Sheets API to read data from our project spreadsheet. To use it:

1. Run `npm install googleapis` to install the required dependency.
2. Create a `service-account.json` file with your Google service account credentials in the repository root.
3. Execute `node app.js` to print the sheet data to the console.

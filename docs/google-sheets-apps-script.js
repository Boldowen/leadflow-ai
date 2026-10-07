/**
 * LeadFlow AI → Google Sheets
 * 1. Open your sheet → Extensions → Apps Script, paste this file, Save.
 * 2. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 * 3. Copy the web app URL (https://script.google.com/macros/s/…/exec) into LeadFlow → Automation.
 */
const HEADERS = ["createdAt", "name", "email", "company", "temperature", "summary", "nextAction", "message"];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

  const data = JSON.parse(e.postData.contents);
  sheet.appendRow(HEADERS.map((key) => data[key] || ""));

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

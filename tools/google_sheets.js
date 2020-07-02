const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
// 原本的範本是有readonly，這樣只有讀取權限，拿掉後什麼權限都有了
// const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

//將下面這些function提供給index.js使用
module.exports.authorize = authorize;
module.exports.listMajors = listMajors;
module.exports.addSheet = addSheet;
module.exports.writeSheet = writeSheet;
module.exports.formatWidth = formatWidth;


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize (credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken (oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors (auth) {//這個是google 提供的範例程式
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.get({
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',//這裡會吐出一堆人名
    range: 'Class Data!A2:E',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        console.log(`${row[0]}, ${row[4]}`);
      });
    } else {
      console.log('No data found.');
    }
  });
}

/** 
**下面的code為正式寫入自己google sheets的程式
**/
async function addSheet (title, sheet_id, auth) {//新增一個sheet到指定的google sheets
  const sheets = google.sheets({ version: 'v4', auth });
  const request = {
    // The ID of the spreadsheet
    "spreadsheetId": process.env.SPREADSHEET_ID,
    "resource": {
      "requests": [{
        "addSheet": {//這個request的任務是addSheet
          // 你想給這個sheet的屬性
          "properties": {
            "sheetId": sheet_id,//必須為數字，且這個欄位是唯一值
            "title": title,
            "gridProperties": {
              "frozenRowCount": 1,//我將最上面那一個列設定為凍結
            },
          }
        },
      }]
    }
  };

  try {
    await sheets.spreadsheets.batchUpdate(request)
    console.log('added sheet:' + title)
  }
  catch (err) {
    console.log('The API returned an error: ' + err);
  }
}
async function writeSheet (data, title, auth, month) {//把資料寫進去新的 sheet
  const sheets = google.sheets({ version: 'v4', auth });
  const request = {
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: title, //Change title if your worksheet's name is something else
    valueInputOption: "USER_ENTERED",// INPUT_VALUE_OPTION_UNSPECIFIED|RAW|USER_ENTERED
    // 如果用RAW會強制轉乘文字，所以前面會多'
    resource: {
      values: data
    }
  }

  try {
    await sheets.spreadsheets.values.append(request)
    console.log("Appended data month:" + month);
  }
  catch (err) {
    console.log('The API returned an error: ' + err);
  }
}
async function formatWidth (sheet_id, auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const request = {
    // The ID of the spreadsheet
    "spreadsheetId": process.env.SPREADSHEET_ID,
    "resource": {
      "requests": [
        {
          "updateDimensionProperties": {//這裡是為了修正欄寬
            "range": {
              "sheetId": sheet_id,
              "dimension": "COLUMNS",
              "startIndex": 0,
              "endIndex": 16//共16欄調整
            },
            "properties": {
              "pixelSize": 70
            },
            "fields": "pixelSize"
          }
        }]
    }
  };
  try {
    await sheets.spreadsheets.batchUpdate(request)
    console.log('formatted sheet:' + sheet_id)
  }
  catch (err) {
    console.log('The API returned an error: ' + err);
  }
}

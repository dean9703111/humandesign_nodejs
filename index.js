const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
require('dotenv').config(); //載入.env環境檔
const { addSheet, writeSheet, formatWidth, authorize } = require("./tools/google_sheets.js");

fs.readFile('google_key/credentials.json', async (err, content) => {
  //首先要讀取經過google sheets驗證過的credentials.json，要有這個檔案才能夠去call Google Sheets API
  if (err) return console.log('Error loading client secret file:', err);

  authorize(JSON.parse(content), async (auth) => {
    // 解析通過後得到的auth可以當成一種鑰匙，讓你去讀寫google sheets

    for (let year = 1910; year <= 2050; year++) {//這裡是設定我要爬蟲的年份

      let sheet_id = year
      let title = year.toString()
      await addSheet(title, sheet_id, auth)//先建立每個年份的sheet
      for (let month = 1; month <= 12; month++) {
        let result = await humandesign(year, month);//result為完成抓取及分析處理過的人類圖資訊
        await writeSheet(result, title, auth, month)//再把所有月份寫到這個sheet裡面
      }
      await formatWidth(sheet_id, auth)
    }
  })
})

function humandesign (year, month) {//抓人類圖網頁爬蟲function
  return new Promise((resolve, reject) => {//因為搭配await所以用Promise來撰寫
    request({
      url: process.env.TARGET_WEB + "?ey=" + year + "&em=" + month, // 人類圖相關查詢網頁
      method: "GET"
    }, async function (error, response, body) {
      if (error || !body) {
        reject(error);//如果爬不動會跳出錯誤訊息
        return;
      }

      const $ = cheerio.load(body); // 載入 body
      const result = []; // 建立一個儲存結果的容器
      if (month == 1) {//只有一月的時候才需要最上面的thead
        const table_head = $('table thead tr td'); // 抓thead爬上面標題的 thead        
        let arr_table_head = []

        for (let i = 0; i < table_head.length; i++) { // 把thead塞入result
          if (i < 2) {
            arr_table_head.push(table_head.eq(i).text())
          }
          else {//因為只有後面的欄位才有title的屬性
            arr_table_head.push(table_head.eq(i).text() + table_head[i].attribs.title)
          }
        }
        result.push(arr_table_head)
      }


      const table_tr = $('table tbody .clickable'); // 爬最外層可點擊的 tr
      for (let i = 0; i < table_tr.length; i++) { // 走訪 tr
        const table_td = table_tr.eq(i).find('td'); // 擷取每個欄位(td)
        let arr_table_tr = []

        arr_table_tr.push(year+'/'+table_td.eq(0).text().replace(/[+']/g, "").trim())//第一欄為年份先填入
        for (let j = 1; j < table_td.length; j++) {
          arr_table_tr.push(table_td.eq(j).text().replace(/[+']/g, "").trim())//在這裡過濾一些不希望出現的字元
        }
        result.push(arr_table_tr)
      }
      resolve(result);//回傳最終組合出來的結果
    });
  })
};

# humandesign_nodejs

基本上這個專案是應朋友之邀來做的實驗性project  

### 專案目標
1. 能成功抓取網頁資料
2. 能依據class來分析所需要的資訊
3. 將抓取到的資料塞到雲端google excel

### 專案技術
1. nodejs
2. npm相關爬蟲套件
3. google 雲端相關api

### 安裝套件
```
yarn
```
### 套件說明
1. cheerio: 把它當成 jquery，可以做標籤的擷取
2. request: 把他想像成 ajax 撈取網頁資料的請求方式，可以把整個網頁的 HTML 抓取下來
3. dotenv: 抓.env的環境設定檔
4. googleapis: 存取google sheets相關api


## 啟動node && 開啟google sheets授權
請先依照[google sheets api 教學](https://developers.google.com/sheets/api/quickstart/nodejs)完成申請
接著下指令
```
node index.js
```
然後會跳出一個網址讓你去得到認證碼  
複製貼上後就能把資料寫進去google sheets嚕


### 錯誤處理(這是google sheets權限不足時會有的問題)
[GaxiosError: Insufficient Permission](https://www.itread01.com/content/1525348938.html)


### 參考資訊
[google sheets api 教學](https://developers.google.com/sheets/api/quickstart/nodejs)
[Oxxo做個簡單的爬蟲](https://www.oxxostudio.tw/articles/201512/spider-basic.html)
[Node.js 爬蟲](https://andy6804tw.github.io/2018/02/11/nodejs-crawler/)
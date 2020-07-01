# humandesign_nodejs

基本上這個專案是應朋友邀來做的實驗性project  

### 專案目標
1. 能成功抓取網頁資料
2. 能依據class來分析所需要的資訊
3. 將抓取到的資料塞到雲端google excel

### 專案技術
1. nodejs
2. npm相關爬蟲套件
3. google 雲端相關api

#### 安裝爬蟲套件
```
yarn add request cheerio
```

#### 啟動node
```
node index.js
```

### 開啟google sheets授權
請先依照[google sheets api 教學](https://developers.google.com/sheets/api/quickstart/nodejs)完成申請
然後可以下指令
```
node google_sheets.js 
```
如果沒意外的話你的google sheets就會成功寫入惹


### 錯誤處理
[GaxiosError: Insufficient Permission](https://www.itread01.com/content/1525348938.html)


### 參考資訊
[google sheets api 教學](https://developers.google.com/sheets/api/quickstart/nodejs)
[人類圖星曆查詢](https://humandesign.org.cn/ephemeris)
[Oxxo做個簡單的爬蟲](https://www.oxxostudio.tw/articles/201512/spider-basic.html)
[Node.js 爬蟲](https://andy6804tw.github.io/2018/02/11/nodejs-crawler/)
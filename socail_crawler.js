const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
require('dotenv').config(); //載入.env環境檔
var webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  Wait = webdriver.wait,
  until = webdriver.until;
const fb_array = require('./json/fb.json');
const ig_array = require('./json/ig.json');
const ig_username = process.env.IG_USERNAME
const ig_userpass = process.env.IG_PASSWORD

// 一開始線建立提供爬蟲使用的browser
var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();


async function facebookFans () {//抓FB頁面粉絲＋追蹤人數
  for (var i = 0; i < fb_array.length; i++) {
    await driver.get(fb_array[i]["url"])
    console.log(fb_array[i]["title"])
    let fb_good_ele = await driver.findElement(By.xpath(`//*[@id="PagesProfileHomeSecondaryColumnPagelet"]//div[contains(@class, '_4bl9')]`))
    const fb_good = await fb_good_ele.getText()
    console.log(`fb_good: ${fb_good}`)

    let fb_fans_ele = await driver.findElement(By.xpath(`//*[@id="PagesProfileHomeSecondaryColumnPagelet"]//div[@class="_4bl9"]/following::*`))
    const fb_fans = await fb_fans_ele.getText()
    console.log(`fb_fans: ${fb_fans}`)
  }
};
async function instagramFans () {//抓Instagram頁面追蹤人數
  // instagram需要登入
  await driver.get('https://www.instragram.com')

  // 等1秒來loading頁面
  await driver.sleep(1000);
  //填入ig登入資訊
  await driver.findElement(By.css("input[name='username']")).sendKeys(ig_username)
  await driver.findElement(By.css("input[name='password']")).sendKeys(ig_userpass)
  //抓到登入按鈕然後點擊
  login_elem = await driver.findElement(By.xpath(`//*[@id="react-root"]/section/main/article/div[2]/div[1]/div/form/div[4]/button`))
  login_elem.click()

  //登入之後轉向
  await driver.sleep(2000);

  //依序抓出需要統計的頁面
  for (var i = 0; i < ig_array.length; i++) {
    await driver.get(ig_array[i]["url"])
    console.log(ig_array[i]["title"])
    let ig_trace_ele = await driver.findElement(By.xpath(`//*[@id="react-root"]/section/main/div/header/section/ul/li[2]`))
    const ig_trace = await ig_trace_ele.getText()
    console.log(`ig_trace: ${ig_trace}`)
  }
};

async function socailCrawler () {
  await facebookFans()
  await instagramFans()
  driver.quit();
}

socailCrawler()
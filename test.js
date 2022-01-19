import fetch from 'node-fetch'
import cheerio from 'cheerio'
import { JSDOM } from 'jsdom'
var iconv = require('iconv-lite');
var request = require('request');

(async () => {
  const options = {
    url: 'https://serv.gcis.nat.gov.tw/pub/cmpy/reportCity.jsp',
    encoding: null
  }

  request(options, (error, reponse, body) => {
    // 將 body 的編碼由 utf8 轉成 big5
    const decodeBody = iconv.decode(Buffer.from(body), 'big5')
    console.log('decodeBody: ', decodeBody)
    // 用 jQuery 的方式讀取 HTML 元件
    var $ = cheerio.load(decodeBody);
    const { document } = (new JSDOM(decodeBody)).window
    document.querySelectorAll('.solid').forEach(el => console.log(el.innerHTML))
  })
  // const response = await fetch('https://serv.gcis.nat.gov.tw/pub/cmpy/reportCity.jsp', {
  //   headers: {
  //     'Content-Type': 'text/html; charset=big5'
  //     // 可以測試 https://www.funliday.com/tw 他們是針對 google bot prerender
  //     // 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  //   },
  //   encoding: null
  // })

  // const body = await response.text()
  // const decodeBody = iconv.decode(Buffer.from(body), 'big5')
  // // const $ = cheerio.load((iconv.decode(Buffer.from(body), 'big5')))
  // const $ = cheerio.load(decodeBody)

  // const { document } = (new JSDOM(body)).window
  // console.log('!!!: ', $('.solid').text())
})()

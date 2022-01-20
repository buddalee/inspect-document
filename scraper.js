import puppeteer from 'puppeteer-extra'
// import resourceBlock from 'puppeteer-extra-plugin-block-resources'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'
import { PuppeteerExtraPluginAdblocker } from 'puppeteer-extra-plugin-adblocker'
import cheerio from 'cheerio'

(async () => {
  const adBlocker = new PuppeteerExtraPluginAdblocker({
    blockTrackers: true
  })
  // puppeteer.use(resourceBlock())
  puppeteer.use(stealthPlugin())
  puppeteer.use(adBlocker)
  const browser = await puppeteer.launch({
    headless: false
  })

  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'zh-TW'
  })
  await page.goto('https://www.youtube.com/c/%E5%8F%8D%E6%AD%A3%E6%88%91%E5%BE%88%E9%96%92/videos')
  // const html = await page.content()
  // const $ = cheerio.load(html)
  // console.log($('#metadata-line span').text())

  const datas = await page.evaluate(async () => {
    // console.log('!!!', document.querySelector('title'))
    const results = []
    document.querySelectorAll('#metadata-line > span:nth-child(1)').forEach(el => {
      if (el.innerText.match(/觀看次數/)) {
        results.push({ number: el.innerText, title: document.querySelector('#metadata-line > span:nth-child(2)').innerText })
      }
    })
    return results
  })
  console.log('datas: ', datas)
  await page.screenshot({ path: 'isStealth.png', fullPage: true })
  await browser.close()
})()

// import puppeteer from 'puppeteer'

// (async () => {
//   const browser = await puppeteer.launch()
//   const page = await browser.newPage()
//   await page.goto('https://bot.sannysoft.com/')
//   await page.screenshot({ path: 'isNaked.png', fullPage: true })
//   await browser.close()
// })()

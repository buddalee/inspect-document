import puppeteer from 'puppeteer-extra'
// import resourceBlock from 'puppeteer-extra-plugin-block-resources'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'
import { PuppeteerExtraPluginAdblocker } from 'puppeteer-extra-plugin-adblocker'

(async () => {
  const adBlocker = new PuppeteerExtraPluginAdblocker({
    blockTrackers: true
  })
  // puppeteer.use(resourceBlock())
  puppeteer.use(stealthPlugin())
  puppeteer.use(adBlocker)
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto('https://bot.sannysoft.com/')
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

import { Cluster } from 'puppeteer-cluster'
import vanillaPuppeteer from 'puppeteer'
import { addExtra } from 'puppeteer-extra'
import Stealth from 'puppeteer-extra-plugin-stealth'
import Recaptcha from 'puppeteer-extra-plugin-recaptcha'
// import fs from 'fs'

class PuppeteerManager {
  constructor (args) {
    this.puppeteer = addExtra(vanillaPuppeteer)
    this.puppeteer.use(Stealth())
    this.puppeteer.use(Recaptcha())
    this.results = new Map()
    this.launchSetting = null
    // this.task = async ({ page, data: url }) => {
    //   await page.goto(url, { waitUntil: 'domcontentloaded' })
    //   const { hostname } = new URL(url)
    //   const { captchas } = await page.findRecaptchas()
    //   console.log(`Found ${captchas.length} captcha on ${hostname}`)
    //   this.results.push({ hostname, captchas: captchas.length })
    // }
  }

  async runPuppeteer (payload, queueCallback) {
    this.cluster = await Cluster.launch({
      puppeteer: this.puppeteer,
      maxConcurrency: 2,
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      puppeteerOptions: {
        headless: true,
        args: [
          '--no-sandbox', // 沙盒模式
          '--disable-setuid-sandbox', // uid沙盒
          '--disable-gpu', // GPU硬件加速
          '--disable-dev-shm-usage', // 创建临时文件共享内存
          '-–no-first-run', // 没有设置首页。在启动的时候，就会打开一个空白页面。
          '--no-zygote'
        ],
        timeout: 300000
      },
      // perBrowserOptions: perBrowserOptions,
      timeout: 300000,
      workerCreationDelay: 200,
      ...this.launchSetting
    })
    // Queue any number of tasks
    this.queue(payload, queueCallback)

    // Define task handler
    // console.log('####', this.task)
    if (this.task) {
      await this.cluster.task(this.task)
    }
    // await this.cluster.task(async ({ page, data: url }) => {
    //   // 使page在DOMContentLoaded事件触发时就返回结果，而无需等到Load事件，这样就节省了等待构建渲染树与页面绘制的时间。
    //   await page.goto(url, { waitUntil: 'domcontentloaded' })
    //   const { hostname } = new URL(url)
    //   const { captchas } = await page.findRecaptchas()
    //   console.log(`Found ${captchas.length} captcha on ${hostname}`)
    //   this.results.push({ hostname, captchas: captchas.length })
    //   // await page.screenshot({ path: `${hostname}.png`, fullPage: true })
    // })
    this.cluster.on('taskerror', (err, data, willRetry) => {
      if (willRetry) {
        console.warn(`Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`)
      } else {
        console.log('Failed to crawl data: ', data)
        console.error(`Failed to crawl ${data}: ${err.message}`)

        const { pathname } = new URL(data)
        const filename = pathname.split('/')[1]
        return this.results.set(filename, {
          ...this.results.get(filename),
          errorCode: 1,
          errorMsg: err.message
        })
      }
    })

    await this.end()
  }

  queue (payload, queueCallback) {
    for (let i = 0; i < payload.urls.length; i++) {
      if (queueCallback) {
        this.cluster.queue({ ...payload, url: payload.urls[i] }, queueCallback)
      } else {
        this.cluster.queue({ ...payload, url: payload.urls[i] })
      }
    }
  }

  async end () {
    console.log('====== 進來 end =======')
    console.log('end: this.results:  ===>', this.results)
    await this.cluster.idle()
    await this.cluster.close().catch(ex => {
      console.log('fail to close the browser!', ex)
    })
    console.log('Done . ✨')
  }

  //  改 winston
  // recordInnerLog (page, filePath) {
  //   const timestamp = new Date().valueOf()
  //   const logFile = fs.createWriteStream(`${filePath}/${timestamp}.txt`, 'utf-8')
  //   page.on('console', msg => {
  //     for (const arg of msg.args()) {
  //       arg.jsonValue().then(v => {
  //         v && logFile.write(JSON.stringify(v) + '\n')
  //       })
  //     }
  //   })
  // }
  async getResults (urls) {
    await this.runPuppeteer(urls)
    return this.results
  }
}

// Let's go
// (async () => {
//   const ms = new PuppeteerManager()
//   await ms.runPuppeteer()
//   ms.queue(['https://bot.sannysoft.com', 'https://www.google.com/recaptcha/api2/demo'])
//   await ms.end()
// })()
export default PuppeteerManager
// main().catch(console.warn)

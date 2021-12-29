import * as appRoot from 'app-root-path'

// event types to observe
const observe = [
  'Page.loadEventFired',
  'Page.domContentEventFired',
  'Page.frameStartedLoading',
  'Page.frameAttached',
  'Network.requestWillBeSent',
  'Network.requestServedFromCache',
  'Network.dataReceived',
  'Network.responseReceived',
  'Network.resourceChangedPriority',
  'Network.loadingFinished',
  'Network.loadingFailed'
]

const extractHostname = url => {
  let hostname
  // find & remove protocol (http, ftp, etc.) and get hostname
  hostname = url.indexOf('//') > -1 ? url.split('/')[2] : url.split('/')[0]
  // find & remove port number
  hostname = hostname.split(':')[0]
  // find & remove "?"
  hostname = hostname.split('?')[0]
  return hostname
}

const getTimestamp = () => Math.floor(new Date().getTime() / 1000)
const getCurrentMonthStamp = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000

const convertToGMBFormat = (data) => {
  // console.log(data)
  const find = require('lodash/find')
  // 固定再第一頁取得
  const kind = find(data.pages[0].content, { x: 309, y: 37 })
  console.log('項目', kind)
  const time = find(data.pages[0].content, { x: 394, y: 54 })
  console.log('時間', time)
  const registrationAuthority = find(data.pages[0].content, { x: 101, y: 85.80000000000001 })
  console.log('登記機關', registrationAuthority)
  const finalData = {}
  finalData.kind = kind.str
  finalData.time = time.str
  finalData.registrationAuthority = registrationAuthority.str
  finalData.datas = []
  // 再來是跑迴圈 data.pages[pageNumber - 1].content，並利用 filter 把所有符合都撈出來
  data.pages.forEach((page, idx) => {
    const currentContents = page.content
    const firstIndexData = find(currentContents, data => (data.x === 23 || data.x === 21 || data.x === 19))
    const firstIndex = firstIndexData && +firstIndexData.str
    // console.log('firstIndex: ', firstIndex)
    const taxIDs = firstIndex ? gmbItem(currentContents, { x: 54 }, true, firstIndex) : null
    const companyName = firstIndex ? gmbItem(currentContents, { x: 181 }, false, firstIndex) : null
    const owner = firstIndex ? gmbItem(currentContents, { x: 289 }, true, firstIndex) : null
    const address = firstIndex ? gmbItem(currentContents, { x: 332 }, false, firstIndex) : null
    const money = firstIndex ? gmbItem(currentContents, { x: 496 }, true, firstIndex) : null
    const registerTime = firstIndex ? gmbItem(currentContents, { x: 538 }, true, firstIndex) : null
    const cates = gmbItem(currentContents, { x: 592 }, false, firstIndex || finalData.datas[finalData.datas.length - 1].no, true)
    // console.log('統一編號', taxIDs)
    // console.log('商業名稱', companyName)
    // console.log('負責人', owner)
    // console.log('商業所在地', address)
    // console.log('資本額', money)
    // console.log('核准設立日期', registerTime)
    // console.log('商業項目說明', cates)
    if (firstIndex) {
      taxIDs.forEach((taxID, idx) => {
        const data = {
          taxID: taxID.str,
          companyName: companyName[idx].str,
          owner: owner[idx].str,
          address: address[idx].str,
          money: money[idx].str,
          registerTime: registerTime[idx].str,
          cates: cates[idx].str,
          no: taxIDs[idx].no
        }
        finalData.datas.push(data)
      })
    } else {
      // console.log('原本: ', finalData['datas'][finalData['datas'].length - 1].cates)
      // console.log('新的: ', cates)
      finalData.datas[finalData.datas.length - 1].cates += `\n ${cates[0].str}`
    }
  })
  const fs = require('fs')
  fs.writeFileSync('test.json', JSON.stringify(finalData))
  // console.log('finalData: ', finalData)
}

const gmbItem = (content, rule, isRemoveFirst, firstIndex, isEnterLine = false) => {
  const filter = require('lodash/filter')
  const find = require('lodash/find')
  let datas = filter(content, data => Math.abs(rule.x - data.x) < 13)
  // 把第一頁項目名稱刪除 好像地址不是
  if (isRemoveFirst) {
    datas.splice(0, 1)
  }
  const itemGroups = filter(content, data => (data.x === 23 || data.x === 21 || data.x === 19)).map(data => +data.y)
  // console.log('itemGroups: ', itemGroups)
  datas = datas.reduce((acc, cur) => {
    // console.log('acc: ', acc)
    // console.log('cur: ', cur)
    if (acc.length > 0 && cur.y - acc[acc.length - 1].y < 11 && !find(itemGroups, group => group === cur.y)) {
      acc[acc.length - 1].str += isEnterLine ? `\n ${cur.str}` : cur.str
      acc[acc.length - 1].y = cur.y
    } else {
      acc.push(cur)
    }
    return acc
  }, [])

  datas = datas.map((data, idx) => ({ str: data.str, no: idx + firstIndex }))
  return datas
}

// https://ictjournal.itri.org.tw/Content/Messagess/contents.aspx?&MmmID=654304432061644411&CatID=654313611255143006&MSID=1071256570640723444
// https://netivism.com.tw/article/147
// https://www.mxp.tw/3943/
// https://dotblogs.com.tw/hatelove/2012/06/05/parse-taiwan-address-with-regex
/// 地址組成：
/// 1.郵遞區號: 3~5碼數字(open data 沒有這個值，所以可以省略)
/// 2.縣市： xx 縣/市
/// 3.鄉鎮市區：xx 鄉/鎮/市/區
/// 4.其他：鄉鎮市區以後的部分
/// 規則：開頭一定要是3或5個數字的郵遞區號，如果不是，解析不會出錯，但ZipCode為空
/// 地址一定要有XX縣/市 + XX鄉/鎮/市/區 + 其他
// https://github.com/arleigh418/Address-Normalization-For-Taiwan-Based-on-GoogleAPI-and-Regular-Expression
// https://github.com/huaying/taiwan-address-parser
//
const addressRegex = addrStr => {
  let str = addrStr
  str = str.replace('縣', '縣/')
  str = str.replace('市', '市/')
  str = str.replace('區', '區/')
  str = str.replace('鄉', '鄉/')
  str = str.replace('鎮', '鎮/')
  str = str.replace('里', '里^/')
  str = str.replace('路', '路/')
  str = str.replace('巷', '巷/')
  str = str.replace('街', '街/')
  str = str.replace('號', '號/')
  // 因為Google回傳的街道地址，會自動把「樓」去掉
  str = str.replace('樓', '樓^')
  let arr = str.split('/')
  if (arr[0].indexOf('臺') > -1) {
    arr[0] = arr[0].replace('臺', '台')
  }
  arr = arr.filter(val => val.indexOf('^') === -1)
  return arr.join('')
}

const autoConvertMapToObject = (map) => {
  const obj = {}
  for (const item of [...map]) {
    const [
      key,
      value
    ] = item
    obj[key] = value
  }
  return obj
}

const DEFAULT_PAGINATION = {
  pageSize: 10,
  pageNumber: 1
}

const PRODUCT_CODE = {
  onePage: 0,
  ndc: 1
}

const AREA_CODE = {
  north: 0,
  middle: 1,
  south: 2
}

const STATIC_DOMAIN = {
  ndc: /^https?:\/\/static.iyp.tw/,
  ndcS3: /^https?:\/\/s3-ap-northeast-1.amazonaws.com\/static.iyp.tw/,
  onePage: /^https?:\/\/images.yep.com.tw/,
  onePageS3: /^https?:\/\/resource.yep.com.tw/
}

const STATIC_WHITELISTS = [
  /^https?:\/\/chart.apis.google.com/,
  /https?:\/\/scdn.line-apps.com/,
  /https?:\/\/fakeimg.pl/,
  /^https?:\/\/www.gstatic.com/
]

export {
  extractHostname,
  getTimestamp,
  convertToGMBFormat,
  addressRegex,
  observe,
  getCurrentMonthStamp,
  appRoot,
  autoConvertMapToObject,
  DEFAULT_PAGINATION,
  PRODUCT_CODE,
  AREA_CODE,
  STATIC_DOMAIN,
  STATIC_WHITELISTS
}

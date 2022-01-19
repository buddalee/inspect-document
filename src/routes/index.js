import express from 'express'
import fetch from 'node-fetch'
import {
  JSDOM
} from 'jsdom'

import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

router.get('/*', async (req, res) => {
  console.log('===> ', req.path, '<===')
  const target = process.env.TARGET
  if (req.path.match(/.js/) || req.path.match(/\/js/)) {
    // return res.redirect(target + req.path)
    return res.status(404).send()
  }
  if (req.path.match(/.css/) || req.path.match(/\/css/)) {
    return res.redirect(target + req.path)
  }

  const response = await fetch(target + req.path, {
    headers: {
      // 可以測試 https://www.funliday.com/tw 他們是針對 google bot prerender
      // 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    }
  })
  const body = await response.text()
  const {
    document
  } = (new JSDOM(body)).window
  const r = document.getElementsByTagName('script')

  for (let i = (r.length - 1); i >= 0; i--) {
    if (r[i].getAttribute('id') !== 'a') {
      r[i].parentNode.removeChild(r[i])
    }
  }
  res.writeHead(200, {
    'content-type': 'text/html; charset=UTF-8'
  })
  res.write(body + `<style>
  body{display:initial!important;opacity: 1!important;}
  .navbar-overlay{display:none;}
  </style>`)
  // res.write(document.documentElement.innerHTML + `<style>
  // body{display:initial!important;opacity: 1!important;}
  // .navbar-overlay{display:none;}
  // </style>`)
  res.end()
})

export default router

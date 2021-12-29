import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

router.get('/*', async (req, res) => {
  const target = process.env.TARGET

  if (req.path.match(/.js/) || req.path.match(/\/js/) ) {
    return res.status(404).send()
  }
  if (req.path.match(/.css/) || req.path.match(/\/css/)) {
    return res.redirect(target + req.path)
  }
  const response = await fetch(target + req.path)
  const body = await response.text()
  res.writeHead(200, {
    'content-type': 'text/html; charset=UTF-8'
  })
  res.write(body + `<style>
  body{display:initial!important;opacity: 1!important;}
  .navbar-overlay{display:none;}
  </style>`)
  res.end()
})

export default router

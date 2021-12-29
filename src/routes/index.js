import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()

router.get('/', async (req, res) => {
  console.log('req.query: ', req.query)
  if (!req.query.url) return res.send('not found url')
  const response = await fetch(req.query.url)
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

router.get('/:pathname(*)', async (req, res) => {
  console.log('req.path: ', req.path)
  if (req.path.match(/_next\/static\//)) {
    return res.status(404).send()
  }
  if (req.path.match(/static\/css\//)) {
    return res.redirect('https://www.aromatale.com.tw' + req.path)
  }
  const response = await fetch('https://www.aromatale.com.tw' + req.path)
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

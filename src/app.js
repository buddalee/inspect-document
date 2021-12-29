import express from 'express'
import inspectDocumentRouter from './routes'

const app = express()


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})
app.use(express.json())
app.use(inspectDocumentRouter)

app.listen(3005, () => {
  console.log('Listening on port 3005')
})

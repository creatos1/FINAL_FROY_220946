require('./tracing')
const express = require('express')
const pino = require('pino')
const pinoHttp = require('pino-http')
const client = require('prom-client')

const app = express()
app.use(express.json())

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })
app.use(pinoHttp({ logger }))

const register = new client.Registry()
client.collectDefaultMetrics({ register })

const requestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2]
})
register.registerMetric(requestDuration)

const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})
register.registerMetric(requestCounter)

const errorCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Total HTTP errors',
  labelNames: ['route', 'type']
})
register.registerMetric(errorCounter)

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', color: process.env.SERVICE_COLOR || 'blue' })
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

app.post('/validate', async (req, res) => {
  const end = requestDuration.startTimer()
  const start = Date.now()
  let status = 200
  try {
    const body = req.body || {}
    const hasFields = body && body.transactionId && body.amount && body.currency
    if (!hasFields) {
      status = 400
      requestCounter.inc({ method: req.method, route: '/validate', status_code: status })
      return res.status(status).json({ error: 'invalid_payload' })
    }

    const hour = new Date().getHours()
    let baseLatency = 50
    if (hour >= 18 && hour <= 22) baseLatency = 180
    const jitter = Math.floor(Math.random() * 60)
    await sleep(baseLatency + jitter)

    const chaosRate = parseFloat(process.env.CHAOS_ERROR_RATE || '0')
    if (Math.random() < chaosRate) {
      status = 500
      errorCounter.inc({ route: '/validate', type: 'chaos' })
      requestCounter.inc({ method: req.method, route: '/validate', status_code: status })
      return res.status(status).json({ error: 'internal_error' })
    }

    requestCounter.inc({ method: req.method, route: '/validate', status_code: status })
    res.status(status).json({ ok: true, validatedAt: new Date().toISOString(), color: process.env.SERVICE_COLOR || 'blue' })
  } catch (e) {
    status = 500
    errorCounter.inc({ route: '/validate', type: 'exception' })
    requestCounter.inc({ method: req.method, route: '/validate', status_code: status })
    res.status(status).json({ error: 'unexpected_error' })
  } finally {
    const duration = (Date.now() - start) / 1000
    end({ method: 'POST', route: '/validate', status_code: status })
    req.log.info({ route: '/validate', duration }, 'request_completed')
  }
})

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

const port = process.env.PORT || 8080
let server
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    logger.info({ port, color: process.env.SERVICE_COLOR || 'blue' }, 'transaction-validator_ready')
  })
}

module.exports = { app, server }


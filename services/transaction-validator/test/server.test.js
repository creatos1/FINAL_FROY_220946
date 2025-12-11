const request = require('supertest')
const { app } = require('../src/server')

describe('Transaction Validator', () => {
  it('health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('validate rejects invalid payload', async () => {
    const res = await request(app).post('/validate').send({})
    expect(res.statusCode).toBe(400)
  })
})


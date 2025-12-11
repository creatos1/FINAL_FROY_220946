import http from 'k6/http'
import { sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 }
  ]
}

export default function () {
  const payload = JSON.stringify({ transactionId: `${Math.random()}`, amount: 10, currency: 'MXN' })
  http.post('http://localhost:8080/validate', payload, { headers: { 'Content-Type': 'application/json' } })
  sleep(0.1)
}


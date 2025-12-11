const fs = require('fs')
const path = require('path')

function svgHeader(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth">` +
    `<path d="M0,0 L10,5 L0,10 z" fill="#333"/></marker></defs>`
}

function box(x, y, w, h, title) {
  const rect = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" ry="8" fill="#f5f7fa" stroke="#333"/>`
  const text = `<text x="${x + w / 2}" y="${y + h / 2}" font-family="Arial" font-size="12" text-anchor="middle" fill="#111">${title}</text>`
  return rect + text
}

function arrow(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#333" stroke-width="2" marker-end="url(#arrow)"/>`
}

function writeSvg(name, content) {
  const outDir = path.resolve(__dirname, '../../../docs/diagrams')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const p = path.join(outDir, name)
  fs.writeFileSync(p, content)
}

function pipeline() {
  const w = 1200, h = 700
  let s = svgHeader(w, h)
  s += box(40, 60, 160, 60, 'Developer')
  s += box(260, 60, 220, 60, 'GitHub Actions build_test')
  s += box(520, 60, 220, 60, 'GitHub Actions deploy_canary')
  s += box(800, 60, 220, 60, 'Docker Compose Stack')
  s += arrow(200, 90, 260, 90)
  s += arrow(480, 90, 520, 90)
  s += arrow(740, 90, 800, 90)

  s += box(260, 200, 220, 60, 'Nginx Proxy')
  s += box(520, 180, 220, 60, 'Transaction-Validator BLUE')
  s += box(520, 260, 220, 60, 'Transaction-Validator GREEN')
  s += arrow(370, 120, 370, 200)
  s += arrow(480, 210, 520, 210)
  s += arrow(480, 240, 520, 240)

  s += box(840, 180, 220, 60, 'Prometheus')
  s += box(840, 260, 220, 60, 'Grafana')
  s += arrow(630, 210, 840, 210)
  s += arrow(950, 210, 950, 260)

  s += box(260, 380, 220, 60, 'Promtail (Docker logs)')
  s += box(520, 380, 220, 60, 'Loki')
  s += arrow(370, 240, 370, 380)
  s += arrow(480, 410, 520, 410)
  s += arrow(630, 410, 950, 290)

  s += box(840, 380, 220, 60, 'Jaeger')
  s += arrow(630, 230, 840, 410)

  s += '</svg>'
  writeSvg('pipeline.svg', s)
}

function canary() {
  const w = 1200, h = 500
  let s = svgHeader(w, h)
  s += box(40, 60, 220, 60, 'BLUE 100%')
  s += box(300, 60, 220, 60, 'Build GREEN')
  s += box(560, 60, 220, 60, 'Start GREEN')
  s += box(820, 60, 220, 60, 'Weights 90/10')
  s += arrow(260, 90, 300, 90)
  s += arrow(520, 90, 560, 90)
  s += arrow(780, 90, 820, 90)

  s += box(300, 180, 220, 60, 'Smoke + Metrics')
  s += box(560, 180, 220, 60, 'Promote 0/100')
  s += box(820, 180, 220, 60, 'Stop BLUE')
  s += arrow(930, 90, 930, 180)
  s += arrow(520, 210, 560, 210)
  s += arrow(780, 210, 820, 210)

  s += box(560, 300, 220, 60, 'Rollback on failure')
  s += arrow(410, 210, 410, 300)
  s += arrow(560, 240, 560, 300)

  s += '</svg>'
  writeSvg('canary_flow.svg', s)
}

function monitoring() {
  const w = 1000, h = 600
  let s = svgHeader(w, h)
  s += box(60, 60, 240, 60, 'Transaction-Validator')
  s += box(380, 60, 220, 60, 'Prometheus')
  s += box(700, 60, 220, 60, 'Grafana')
  s += arrow(300, 90, 380, 90)
  s += arrow(600, 90, 700, 90)

  s += box(60, 220, 240, 60, 'Promtail (reads docker logs)')
  s += box(380, 220, 220, 60, 'Loki')
  s += arrow(300, 250, 380, 250)
  s += arrow(600, 250, 700, 90)

  s += box(380, 380, 220, 60, 'Jaeger')
  s += arrow(300, 90, 380, 410)

  s += '</svg>'
  writeSvg('monitoring_arch.svg', s)
}

function topology() {
  const w = 1200, h = 700
  let s = svgHeader(w, h)
  s += `<rect x="20" y="20" width="1160" height="660" fill="#eef2f7" stroke="#333"/>`
  s += `<text x="600" y="40" font-family="Arial" font-size="14" text-anchor="middle">Network: monitor</text>`
  s += box(60, 80, 220, 60, 'reverse-proxy (Nginx)')
  s += box(60, 180, 220, 60, 'transaction-validator-blue')
  s += box(60, 280, 220, 60, 'transaction-validator-green')
  s += box(340, 80, 220, 60, 'prometheus')
  s += box(340, 180, 220, 60, 'grafana')
  s += box(340, 280, 220, 60, 'loki')
  s += box(340, 380, 220, 60, 'promtail')
  s += box(340, 480, 220, 60, 'jaeger')
  s += arrow(170, 140, 170, 180)
  s += arrow(170, 240, 170, 280)
  s += arrow(170, 110, 450, 110)
  s += arrow(170, 210, 450, 110)
  s += arrow(170, 310, 450, 110)
  s += arrow(170, 210, 450, 210)
  s += arrow(170, 310, 450, 210)
  s += arrow(170, 210, 450, 310)
  s += arrow(170, 310, 450, 310)
  s += arrow(170, 210, 450, 510)
  s += arrow(170, 310, 450, 510)
  s += '</svg>'
  writeSvg('docker_topology.svg', s)
}

function sliMap() {
  const w = 1000, h = 600
  let s = svgHeader(w, h)
  s += box(60, 60, 240, 60, 'SLA 99.5% mensual')
  s += box(380, 60, 240, 60, 'SLO disponibilidad 99.7%')
  s += box(380, 140, 240, 60, 'SLO latencia p95 < 250ms')
  s += box(380, 220, 240, 60, 'SLO error rate < 0.8%')
  s += arrow(300, 90, 380, 90)
  s += arrow(300, 90, 380, 170)
  s += arrow(300, 90, 380, 250)
  s += box(700, 60, 240, 60, 'SLI disponibilidad')
  s += box(700, 140, 240, 60, 'SLI latencia p95')
  s += box(700, 220, 240, 60, 'SLI error rate')
  s += arrow(620, 90, 700, 90)
  s += arrow(620, 170, 700, 170)
  s += arrow(620, 250, 700, 250)
  s += box(380, 360, 240, 60, 'Presupuesto de errores ≈ 216 min/mes')
  s += arrow(300, 90, 380, 390)
  s += '</svg>'
  writeSvg('sli_map.svg', s)
}

function main() {
  pipeline()
  canary()
  monitoring()
  topology()
  sliMap()
}

main()

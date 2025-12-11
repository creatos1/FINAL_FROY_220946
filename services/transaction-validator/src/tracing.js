const { NodeSDK } = require('@opentelemetry/sdk-node')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http')

const exporter = new OTLPTraceExporter({
  url: process.env.OTLP_ENDPOINT || 'http://jaeger:4318/v1/traces'
})

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()]
})

sdk.start()

process.on('SIGTERM', async () => {
  await sdk.shutdown()
  process.exit(0)
})


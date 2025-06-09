'use strict'

import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
})

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [new HttpInstrumentation()],
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'api-gateway',
  }),
})

sdk.start()

const shutdown = () =>
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch(err => console.error('Error terminating tracing', err))
    .finally(() => process.exit(0))

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

export default sdk

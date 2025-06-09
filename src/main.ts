import '../tracer'

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { applyGlobalConfig } from './global-config'

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  try {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        },
        consumer: {
          groupId: 'api-gateway-consumer',
        },
      },
    })

    await app.startAllMicroservices()
    logger.log('✅ Kafka microservice conectado com sucesso')
  } catch (error) {
    logger.error(
      '❌ Erro ao conectar com Kafka. Continuando aplicação...',
      error.message,
    )
  }

  const config = new DocumentBuilder()
    .setTitle('Watch Api Gateway')
    .setDescription(
      'Node.js Rest API - NestJs, Typescript, DDD, Clean Architecture and Automated Tests',
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      description: 'Informar o JWT para autorizar o acesso',
      name: 'Authorization',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await applyGlobalConfig(app)

  await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0')
  logger.log(`🚀 Aplicação rodando na porta ${process.env.PORT || 3000}`)
}

bootstrap()

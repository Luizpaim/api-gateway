import { Module } from '@nestjs/common'
import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices'
import { PuducerKafkaProvider } from './kafka.provider'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'api-gateway',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },

          consumer: {
            groupId: 'api-gateway-consumer',
          },
        },
      },
    ]),
  ],

  providers: [
    {
      provide: 'KafkaProvider',
      useFactory: async (kafkaClient: ClientKafka) => {
        const provider = new PuducerKafkaProvider(kafkaClient)
        await provider.onModuleInit()
        return provider
      },
      inject: ['KAFKA_PRODUCER'],
    },
  ],
  exports: ['KafkaProvider'],
})
export class KafkaModule {}

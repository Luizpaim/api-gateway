import { ClientKafka } from '@nestjs/microservices'
import { KafkaProvider } from '@/shared/application/providers/kafka-provider'

import { Admin, Kafka, ITopicConfig } from 'kafkajs'
import { Logger } from '@nestjs/common'

export class PuducerKafkaProvider implements KafkaProvider {
  private readonly logger = new Logger('PuducerKafkaProvider')

  private admin: Admin

  constructor(private readonly kafkaClient: ClientKafka) {}

  public async onModuleInit(): Promise<void> {
    const kafka = new Kafka({
      clientId: 'api-gateway',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    })

    this.logger.log('Init Module Kafka')

    this.admin = kafka.admin()
    await this.admin.connect()

    const topics = await this.admin.listTopics()
    const topicsList: ITopicConfig[] = []

    if (!topics.includes('user.created')) {
      topicsList.push({
        topic: 'user.created',
        numPartitions: 1,
        replicationFactor: 1,
      })
    }

    if (topicsList.length) {
      await this.admin.createTopics({ topics: topicsList })
      this.logger.log('Topic Kafka created', topicsList)
    }

    await this.admin.disconnect()
  }

  public publishEvent<T>({
    eventName,
    data,
  }: {
    eventName: string
    data: T
  }): void {
    this.kafkaClient.emit(eventName, {
      value: JSON.stringify(data),
    })
    this.logger.log('Topic Kafka emited event', eventName)
  }
}

export interface KafkaProvider {
  onModuleInit(): Promise<void>
  publishEvent<T>(params: { eventName: string; data: T }): void
}

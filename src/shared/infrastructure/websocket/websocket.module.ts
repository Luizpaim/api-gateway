import { Module } from '@nestjs/common'

import { WebsocketProducerProvider } from './websocket.provider'

@Module({
  imports: [],
  providers: [
    {
      provide: 'WebsocketProvider',
      useClass: WebsocketProducerProvider,
    },
  ],
  exports: ['WebsocketProvider'],
})
export class WebsocketModule {}

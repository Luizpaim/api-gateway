import { WebsocketProvider } from '@/shared/application/providers/websocket-provider'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { WrapperWebsocketInterceptor } from '../interceptors/wrapper-data/wrapper-websocket.interceptor'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
  cors: { origin: process.env.CORS_CREDENTIALS || '*' },
})
export class WebsocketProducerProvider
  implements WebsocketProvider, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private connectedUsers = new Map<string, string>()

  private readonly logger = new Logger('WebsocketProducerProvider')

  afterInit(server: Server) {
    server.use(WrapperWebsocketInterceptor)
  }

  public handleConnection(client: Socket): void {
    const user = client.data.user
    if (user?.id) {
      for (const [sid, uid] of this.connectedUsers.entries()) {
        if (uid === user.id) this.connectedUsers.delete(sid)
      }
      this.connectedUsers.set(client.id, user.id)
      this.logger.log(`Connected websocket: ${user.id} (${client.id})`)
    } else {
      client.disconnect()
    }
  }

  public handleDisconnect(client: Socket): void {
    const userId = this.connectedUsers.get(client.id)
    this.connectedUsers.delete(client.id)
    this.logger.warn(`Desconnected websocket: ${userId} (${client.id})`)
  }

  public broadcastPublicMessage<T>(params: {
    userId: string
    data: T
    event: string
  }): void {
    const { userId, data, event } = params

    try {
      for (const [socketId, uid] of this.connectedUsers.entries()) {
        if (uid === userId) {
          this.server.to(socketId).emit(event, {
            message: data,
          })
        }
      }
      this.logger.log(`Send websocket: ${userId}`)
    } catch (error) {
      this.logger.error(`Error Send websocket: ${userId}`)
    }
  }

  public sendMessage<T>(params: { event: string; data: T }): void {
    const { event, data } = params
    try {
      this.server.emit(event, {
        message: data,
      })
      this.logger.log(`Send websocket no authenticate: ${event}`)
    } catch (error) {
      this.logger.error(`Error Send websocket no authenticate: ${event}`)
    }
  }
}

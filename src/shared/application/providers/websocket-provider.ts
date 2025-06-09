import { Socket } from 'socket.io'

export interface WebsocketProvider {
  handleConnection(client: Socket): void
  handleDisconnect(client: Socket): void
  sendMessage<T>(params: { userId: string; data: T; event: string }): void
  broadcastPublicMessage<T>(params: {
    userId: string
    data: T
    event: string
  }): void
}

import { Socket } from 'socket.io'
import * as jwt from 'jsonwebtoken'
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error'

const JWT_SECRET = process.env.JWT_SECRET || 'my_secret'

export function WrapperWebsocketInterceptor(
  socket: Socket,
  next: (err?: Error) => void,
) {
  const token = socket.handshake.auth?.token

  if (!token) return next(new InvalidCredentialsError('Token not found'))

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string
    }

    socket.data.user = {
      id: payload.id,
    }

    return next()
  } catch (err) {
    return next(new InvalidCredentialsError('Token invalid'))
  }
}

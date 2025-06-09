import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'
import { UserOutput } from '@/users/application/dtos/user-output'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

type GenerateJwtProps = {
  accessToken: string
  id: string
  companyId: string
  name: string
  email: string
  createdAt: Date
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: EnvConfigService,
  ) {}

  async generateJwt(user: UserOutput): Promise<GenerateJwtProps> {
    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      companyId: user.companyId,
    })

    const { password, ...safeUser } = user

    return {
      accessToken,
      ...safeUser,
    }
  }

  async verifyJwt(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.getJwtSecret(),
    })
  }
}

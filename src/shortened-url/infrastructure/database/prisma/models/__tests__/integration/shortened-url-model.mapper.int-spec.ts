import { ValidationError } from '@/shared/domain/errors/validation-error'
import { ShortenedUrlModelMapper } from '../../shortened-url-model.mapper'
import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'
import { PrismaClient, Company, ShortenedUrl } from '@prisma/client'
import { Test, TestingModule } from '@nestjs/testing'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'

function makeProps(
  overrides: Partial<Omit<ShortenedUrl, 'id'>> = {},
): Omit<ShortenedUrl, 'id'> {
  const now = new Date()
  return {
    companyId: overrides.companyId!,
    userId: overrides.userId ?? null,
    shortCode: overrides.shortCode ?? 'SC001',
    shortUrl: overrides.shortUrl ?? 'http://short.ly',
    longUrl: overrides.longUrl ?? 'https://example.com/foo',
    visitsTotal: overrides.visitsTotal ?? 0,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    deletedAt: overrides.deletedAt ?? null,
  }
}

describe('ShortenedUrlModelMapper integration tests', () => {
  let prismaService: PrismaClient
  let module: TestingModule
  let company: Company

  beforeAll(async () => {
    setupPrismaTests()
    prismaService = new PrismaClient()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    await prismaService.$connect()
  })

  beforeEach(async () => {
    await prismaService.shortenedUrl.deleteMany()
    company = await prismaService.company.create({
      data: { name: 'Acme', category: 'Tech' },
    })
  })

  afterAll(async () => {
    await prismaService.$disconnect()
    await module.close()
  })

  it('should throw ValidationError when model is invalid', () => {
    const now = new Date()
    const invalidModel: any = {
      id: 'fake-id',
      companyId: company.id,
      userId: null,
      shortCode: 'SC001',
      shortUrl: 'http://short.ly',
      longUrl: undefined,
      visitsTotal: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }
    expect(() =>
      ShortenedUrlModelMapper.toEntity(invalidModel as ShortenedUrl),
    ).toThrow(ValidationError)
  })

  it('should convert a model to entity correctly', async () => {
    const now = new Date()
    const props = makeProps({
      companyId: company.id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })
    const model = await prismaService.shortenedUrl.create({ data: props })
    const entity = ShortenedUrlModelMapper.toEntity(model)
    expect(entity).toBeInstanceOf(ShortenedUrlEntity)
    expect(entity.toJSON()).toMatchObject(props)
  })
})

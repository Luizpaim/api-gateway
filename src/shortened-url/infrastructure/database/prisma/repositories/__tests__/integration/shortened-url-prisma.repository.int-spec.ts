import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { PrismaClient, Company } from '@prisma/client'
import { Test, TestingModule } from '@nestjs/testing'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'

import {
  ShortenedUrlEntity,
  ShortenedUrlProps,
} from '@/shortened-url/domain/entities/shortened-url.entity'
import { ShortenedUrlPrismaRepository } from '../../shortened-url-prisma.repository'

function makeProps(
  overrides: Partial<ShortenedUrlProps> = {},
): ShortenedUrlProps {
  return {
    shortCode: 'SC001',
    shortUrl: 'http://short.ly',
    longUrl: 'https://example.com/foo',
    visitsTotal: 0,
    ...overrides,
  }
}

describe('ShortenedUrlPrismaRepository integration tests', () => {
  let prismaService: PrismaClient
  let sut: ShortenedUrlPrismaRepository
  let module: TestingModule
  let company: Company

  beforeAll(async () => {
    setupPrismaTests()
    prismaService = new PrismaClient()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
  })

  beforeEach(async () => {
    company = await prismaService.company.create({
      data: { name: 'Acme', category: 'Tech' },
    })
    sut = new ShortenedUrlPrismaRepository(prismaService as any)
    await prismaService.shortenedUrl.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('throws ConflictError on duplicate shortCode', async () => {
    const entity = new ShortenedUrlEntity(makeProps({ companyId: company.id }))
    await prismaService.shortenedUrl.create({ data: entity.toJSON() })
    await expect(sut.shortCodeExists(entity.shortCode)).rejects.toThrow(
      new ConflictError('ShortCode address already used'),
    )
  })

  it('resolves when shortCode is unique', async () => {
    await expect(sut.shortCodeExists('UNIQ01')).resolves.toBeUndefined()
  })

  it('throws NotFoundError when findById not found', async () => {
    await expect(() =>
      sut.findById('no-id', company.id, null as any),
    ).rejects.toThrow(
      new NotFoundError('ShortenedUrlModel not found using ID no-id'),
    )
  })

  it('findById returns existing entity', async () => {
    const props = makeProps({ companyId: company.id })
    const entity = new ShortenedUrlEntity(props)
    const created = await prismaService.shortenedUrl.create({
      data: entity.toJSON(),
    })
    const found = await sut.findById(
      created.id,
      props.companyId!,
      props.userId as any,
    )
    expect(found.toJSON()).toMatchObject(entity.toJSON())
  })

  it('insert persists a new record', async () => {
    const entity = new ShortenedUrlEntity(makeProps({ companyId: company.id }))
    await sut.insert(entity)
    const raw = await prismaService.shortenedUrl.findUnique({
      where: { id: entity._id },
    })
    expect(raw).toMatchObject(entity.toJSON())
  })

  it('findAll returns all records', async () => {
    const entity = new ShortenedUrlEntity(makeProps({ companyId: company.id }))
    await prismaService.shortenedUrl.create({ data: entity.toJSON() })
    const list = await sut.findAll()
    expect(list).toHaveLength(1)
    expect(list[0].toJSON()).toMatchObject(entity.toJSON())
  })

  it('throws NotFoundError on update of non-existent', async () => {
    const entity = new ShortenedUrlEntity(makeProps({ companyId: company.id }))
    await expect(() => sut.update(entity)).rejects.toThrow(
      new NotFoundError(`ShortenedUrlModel not found using ID ${entity._id}`),
    )
  })

  it('update persists changes to existing record', async () => {
    const props = makeProps({ companyId: company.id })
    const entity = new ShortenedUrlEntity(props)
    const created = await prismaService.shortenedUrl.create({
      data: entity.toJSON(),
    })
    entity.updateProps({ shortUrl: 'http://new.url' })
    await sut.update(entity)
    const raw = await prismaService.shortenedUrl.findUnique({
      where: { id: created.id },
    })
    expect(raw!.shortUrl).toBe('http://new.url')
  })

  it('throws NotFoundError on delete of non-existent', async () => {
    await expect(() =>
      sut.delete('nope', company.id, null as any),
    ).rejects.toThrow(
      new NotFoundError('ShortenedUrlModel not found using ID nope'),
    )
  })

  it('delete sets deletedAt on existing record', async () => {
    const props = makeProps({ companyId: company.id })
    const entity = new ShortenedUrlEntity(props)
    const created = await prismaService.shortenedUrl.create({
      data: entity.toJSON(),
    })
    await sut.delete(created.id, props.companyId!, props.userId as any)
    const raw = await prismaService.shortenedUrl.findUnique({
      where: { id: created.id },
    })
    expect(raw!.deletedAt).toBeInstanceOf(Date)
  })
})

import { ShortenedUrlOutput } from '@/shortened-url/application/dtos/shortened-url-output'
import { ListShortenedUrlUseCase } from '@/shortened-url/application/usecases/list-shortened-url.usecase'
import { ListShortenedUrlDto } from '../../dtos/list-shortened-url.dto'
import { SignupShortenedUrlDto } from '../../dtos/signup-shortened-url.dto'
import { UpdateShortenedUrlDto } from '../../dtos/update-shortened-url.dto'
import {
  ShortenedUrlPresenter,
  ShortenedUrlCollectionPresenter,
} from '../../presenters/shortened-url.presenter'
import { ShortenedUrlController } from '../../shortened-url.controller'

describe('ShortenedUrlController unit tests', () => {
  let sut: ShortenedUrlController
  const user = { id: 'user1', companyId: 'comp1' }
  const id = 'url1'

  const signupDto: SignupShortenedUrlDto = {
    longUrl: 'http://long',
  }
  const listDto: ListShortenedUrlDto = { page: 1, perPage: 5 }
  const updateDto: UpdateShortenedUrlDto = { longUrl: 'http://updated' }

  const output: ShortenedUrlOutput = {
    id,
    companyId: user.companyId,
    userId: user.id,
    longUrl: signupDto.longUrl,
    shortCode: 'qwerty',
    shortUrl: 'http://short.ly/SC1',
    visitsTotal: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const listOutput: ListShortenedUrlUseCase.Output = {
    items: [output],
    total: 1,
    currentPage: 1,
    perPage: 5,
    lastPage: 1,
  }

  beforeEach(() => {
    sut = new ShortenedUrlController()
    sut['signupShortenedUrlUseCase'] = {
      execute: jest.fn().mockResolvedValue(output),
    } as any
    sut['listShortenedUrlUseCase'] = {
      execute: jest.fn().mockResolvedValue(listOutput),
    } as any
    sut['getShortenedUrlUseCase'] = {
      execute: jest.fn().mockResolvedValue(output),
    } as any
    sut['updateShortenedUrlUseCase'] = {
      execute: jest.fn().mockResolvedValue(output),
    } as any
    sut['updateVisitsTotalUseCase'] = {
      execute: jest.fn().mockResolvedValue(output),
    } as any
    sut['deleteShortenedUrlUseCase'] = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as any
  })

  it('should create a shortened URL', async () => {
    const presenter = await sut.create(signupDto, user)
    expect(presenter).toBeInstanceOf(ShortenedUrlPresenter)
    expect(presenter).toStrictEqual(new ShortenedUrlPresenter(output))
    expect(sut['signupShortenedUrlUseCase'].execute).toHaveBeenCalledWith({
      ...signupDto,
      companyId: user.companyId,
      userId: user.id,
    })
  })

  it('should list shortened URLs', async () => {
    const collection = await sut.search(listDto, user)
    expect(collection).toBeInstanceOf(ShortenedUrlCollectionPresenter)
    expect(collection).toStrictEqual(
      new ShortenedUrlCollectionPresenter(listOutput),
    )
    expect(sut['listShortenedUrlUseCase'].execute).toHaveBeenCalledWith({
      ...listDto,
      companyId: user.companyId,
      userId: user.id,
    })
  })

  it('should get one shortened URL', async () => {
    const presenter = await sut.findOne(id, user)
    expect(presenter).toBeInstanceOf(ShortenedUrlPresenter)
    expect(presenter).toStrictEqual(new ShortenedUrlPresenter(output))
    expect(sut['getShortenedUrlUseCase'].execute).toHaveBeenCalledWith({
      id,
      companyId: user.companyId,
      userId: user.id,
    })
  })

  it('should update a shortened URL', async () => {
    const presenter = await sut.update(id, updateDto, user)
    expect(presenter).toBeInstanceOf(ShortenedUrlPresenter)
    expect(presenter).toStrictEqual(new ShortenedUrlPresenter(output))
    expect(sut['updateShortenedUrlUseCase'].execute).toHaveBeenCalledWith({
      id,
      companyId: user.companyId,
      userId: user.id,
      ...updateDto,
    })
  })

  it('should update visits total', async () => {
    const presenter = await sut.updateVisitsTotal(id, user)
    expect(presenter).toBeInstanceOf(ShortenedUrlPresenter)
    expect(presenter).toStrictEqual(new ShortenedUrlPresenter(output))
    expect(sut['updateVisitsTotalUseCase'].execute).toHaveBeenCalledWith({
      id,
      companyId: user.companyId,
      userId: user.id,
    })
  })

  it('should delete a shortened URL', async () => {
    const result = await sut.remove(id, user)
    expect(result).toBeUndefined()
    expect(sut['deleteShortenedUrlUseCase'].execute).toHaveBeenCalledWith({
      id,
      companyId: user.companyId,
      userId: user.id,
    })
  })
})

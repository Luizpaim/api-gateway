import { HttpService } from '@nestjs/axios'
import { HttpException } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import { ShortenedUrlProvider } from '../../shortened-url-shlink.provider'

describe('ShortenedUrlProvider', () => {
  let provider: ShortenedUrlProvider
  let axiosRef: any
  const apiKey = 'test-key'
  const baseUrl = 'https://api.test'

  beforeAll(() => {
    process.env.SHORTENED_URL_API_KEY = apiKey
    process.env.SHORTENED_URL_BASE_URL = baseUrl
  })

  beforeEach(() => {
    axiosRef = {
      get: jest.fn(),
      delete: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
    }
    provider = new ShortenedUrlProvider({ axiosRef } as HttpService)
  })

  function expectedHeaders() {
    return { 'X-Api-Key': apiKey, Accept: 'application/json' }
  }

  describe('listShortUrls', () => {
    const params = { domain: 'example' }

    it('should return array of shortUrls', async () => {
      const data = { shortUrls: [{ code: 'A' }] }
      axiosRef.get.mockResolvedValue({ data } as AxiosResponse)

      const result = await provider.listShortUrls(params)

      expect(axiosRef.get).toHaveBeenCalledWith(
        `${baseUrl}/rest/v2/short-urls`,
        { headers: expectedHeaders(), params },
      )
      expect(result).toEqual(data.shortUrls)
    })

    it('should throw HttpException on API error with response', async () => {
      const error = { response: { data: 'err', status: 400 } }
      axiosRef.get.mockRejectedValue(error)

      await expect(provider.listShortUrls(params)).rejects.toThrow(HttpException)
      try { await provider.listShortUrls(params) } catch (e: any) {
        expect(e.getResponse()).toBe('err')
        expect(e.getStatus()).toBe(400)
      }
    })

    it('should throw HttpException on API error without response', async () => {
      const error = { message: 'net fail' }
      axiosRef.get.mockRejectedValue(error)

      await expect(provider.listShortUrls(params)).rejects.toThrow(HttpException)
      try { await provider.listShortUrls(params) } catch (e: any) {
        expect(e.getResponse()).toBe('net fail')
        expect(e.getStatus()).toBe(500)
      }
    })
  })

  describe('getShortUrl', () => {
    const code = 'abc'
    it('should return a shortUrl', async () => {
      const data = { code, longUrl: 'x' }
      axiosRef.get.mockResolvedValue({ data } as AxiosResponse)

      const result = await provider.getShortUrl(code)
      expect(axiosRef.get).toHaveBeenCalledWith(
        `${baseUrl}/rest/v2/short-urls/${encodeURIComponent(code)}`,
        { headers: expectedHeaders() },
      )
      expect(result).toEqual(data)
    })

    it('should propagate errors', async () => {
      axiosRef.get.mockRejectedValue({ response: { data: 'e', status: 404 } })
      await expect(provider.getShortUrl(code)).rejects.toThrow(HttpException)
    })
  })

  describe('deleteShortUrl', () => {
    const code = 'del'
    it('should call delete and succeed', async () => {
      axiosRef.delete.mockResolvedValue({} as AxiosResponse)
      await expect(provider.deleteShortUrl(code)).resolves.toBeUndefined()
      expect(axiosRef.delete).toHaveBeenCalledWith(
        `${baseUrl}/rest/v2/short-urls/${encodeURIComponent(code)}`,
        { headers: expectedHeaders() },
      )
    })

    it('should propagate delete errors', async () => {
      axiosRef.delete.mockRejectedValue({ response: { data: 'e', status: 500 } })
      await expect(provider.deleteShortUrl(code)).rejects.toThrow(HttpException)
    })
  })

  describe('getShortUrlVisits', () => {
    const code = 'vis'
    it('should return visits object', async () => {
      const data = { visits: { pagination: {} as any } }
      axiosRef.get.mockResolvedValue({ data } as AxiosResponse)
      const result = await provider.getShortUrlVisits(code)
      expect(axiosRef.get).toHaveBeenCalledWith(
        `${baseUrl}/rest/v2/short-urls/${encodeURIComponent(code)}/visits`,
        { headers: expectedHeaders() },
      )
      expect(result).toEqual(data)
    })

    it('should propagate errors', async () => {
      axiosRef.get.mockRejectedValue({ response: { data: 'e', status: 401 } })
      await expect(provider.getShortUrlVisits(code)).rejects.toThrow(HttpException)
    })
  })

  describe('createShortUrl', () => {
    it('should return created entity', async () => {
      const payload = { longUrl: 'http://l', shortCode: 'c' }
      const data = { id: 'i', ...payload } as any
      axiosRef.post.mockResolvedValue({ data } as AxiosResponse)
      const result = await provider.createShortUrl(payload)
      expect(axiosRef.post).toHaveBeenCalledWith(
        `${baseUrl}/rest/v2/short-urls`,
        payload,
        { headers: expectedHeaders() },
      )
      expect(result).toEqual(data)
    })

    it('should propagate errors', async () => {
      axiosRef.post.mockRejectedValue({ message: 'fail' })
      await expect(provider.createShortUrl({ longUrl: 'x' } as any)).rejects.toThrow(HttpException)
    })
  })

  describe('editShortUrl', () => {
    const code = 'edt'
    it('should return edited entity', async () => {
      const body = { longUrl: 'new' }
      const data = { code, ...body } as any
      axiosRef.patch.mockResolvedValue({ data } as AxiosResponse)
      const result = await provider.editShortUrl(code, body)
      expect(axiosRef.patch).toHaveBeenCalledWith(
        `${baseUrl}/rest/v3/short-urls/${code}`,
        body,
        { headers: expectedHeaders() },
      )
      expect(result).toEqual(data)
    })

    it('should propagate errors', async () => {
      axiosRef.patch.mockRejectedValue({ response: { data: 'e', status: 403 } })
      await expect(provider.editShortUrl(code, { longUrl: '' })).rejects.toThrow(HttpException)
    })
  })
})

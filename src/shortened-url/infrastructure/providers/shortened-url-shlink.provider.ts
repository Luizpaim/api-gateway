// src/shortened-url/infrastructure/shlink-http.service.ts

import {
  ShortenedUrl,
  ShortenedUrlShlinkProvider,
} from '@/shared/application/providers/shortened-url-shlink.provider'
import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable, Logger } from '@nestjs/common'
import {
  ShlinkShortUrlsListParams,
  ShlinkShortUrl,
} from '@shlinkio/shlink-js-sdk/dist/api-contract.js'
import { AxiosInstance, AxiosResponse } from 'axios'

@Injectable()
export class ShortenedUrlProvider implements ShortenedUrlShlinkProvider {
  private readonly logger = new Logger(ShortenedUrlProvider.name)
  private readonly apiKey = process.env.SHORTENED_URL_API_KEY
  private readonly baseUrl = process.env.SHORTENED_URL_BASE_URL
  private readonly axios: AxiosInstance

  constructor(private readonly http: HttpService) {
    this.axios = http.axiosRef
  }

  private headers() {
    return {
      'X-Api-Key': this.apiKey,
      Accept: 'application/json',
    }
  }

  async listShortUrls(
    params: ShlinkShortUrlsListParams,
  ): Promise<ShlinkShortUrl[]> {
    const url = `${this.baseUrl}/rest/v2/short-urls`
    try {
      const res: AxiosResponse<any> = await this.axios.get(url, {
        headers: this.headers(),
        params,
      })
      return res.data.shortUrls
    } catch (err) {
      this.handleError(err)
    }
  }

  async getShortUrl(code: string): Promise<ShlinkShortUrl> {
    const url = `${this.baseUrl}/rest/v2/short-urls/${encodeURIComponent(code)}`
    try {
      const res = await this.axios.get(url, {
        headers: this.headers(),
      })
      return res.data
    } catch (err) {
      this.handleError(err)
    }
  }

  async deleteShortUrl(code: string): Promise<void> {
    const url = `${this.baseUrl}/rest/v2/short-urls/${encodeURIComponent(code)}`
    try {
      await this.axios.delete(url, {
        headers: this.headers(),
      })
    } catch (err) {
      this.handleError(err)
    }
  }

  async getShortUrlVisits(code: string): Promise<{
    visits: {
      pagination: {
        currentPage: number
        pagesCount: number
        itemsPerPage: number
        itemsInCurrentPage: number
        totalItems: number
      }
    }
  }> {
    const url = `${this.baseUrl}/rest/v2/short-urls/${encodeURIComponent(code)}/visits`
    try {
      const res = await this.axios.get(url, {
        headers: this.headers(),
      })
      return res.data
    } catch (err) {
      this.handleError(err)
    }
  }

  async createShortUrl(
    data: Partial<ShlinkShortUrl> & { longUrl: string },
  ): Promise<ShortenedUrl> {
    const url = `${this.baseUrl}/rest/v2/short-urls`
    try {
      const res: AxiosResponse<ShortenedUrl> = await this.axios.post(
        url,
        data,
        {
          headers: this.headers(),
        },
      )
      return res.data
    } catch (err) {
      this.handleError(err)
    }
  }

  async editShortUrl(
    code: string,
    body: {
      longUrl: string
    },
  ): Promise<ShortenedUrl> {
    const url = `${this.baseUrl}/rest/v3/short-urls/${code}`
    try {
      const res = await this.axios.patch<ShortenedUrl>(url, body, {
        headers: this.headers(),
      })
      return res.data
    } catch (err) {
      this.handleError(err)
    }
  }

  private handleError(err: any): never {
    this.logger.error(
      'Erro ao consumir Shlink API',
      err.response?.data || err.message,
    )
    if (err.response?.data) {
      throw new HttpException(err.response.data, err.response.status)
    }
    throw new HttpException(err.message, 500)
  }
}

import { Record } from '@prisma/client/runtime/library'

export type ShortenedUrl = {
  shortUrl: string
  shortCode: string
  longUrl: string
  dateCreated: string
  tags: string[]
  meta: {
    validSince: string | null
    validUntil: string | null
    maxVisits: number | null
  }
  domain: string | null
  title: string | null
  crawlable: boolean
  forwardQuery: boolean
  visitsSummary: {
    total: number
    nonBots: number
    bots: number
  }
  hasRedirectRules: boolean
  defaultLongUrl: string
}

export interface ShortenedUrlShlinkProvider {
  listShortUrls(params: Record<string, any>): Promise<Record<string, any>>
  getShortUrl(code: string): Promise<Record<string, any>>
  createShortUrl(params: {
    longUrl: string
    shortCodeLength: number
    tags: string[]
  }): Promise<ShortenedUrl>
  deleteShortUrl(code: string): Promise<void>
  editShortUrl(
    code: string,
    body: {
      longUrl: string
    },
  ): Promise<ShortenedUrl>
  getShortUrlVisits(code: string): Promise<{
    visits: {
      pagination: {
        currentPage: number
        pagesCount: number
        itemsPerPage: number
        itemsInCurrentPage: number
        totalItems: number
      }
    }
  }>
}

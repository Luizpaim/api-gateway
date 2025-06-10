import { Entity } from '../entities/entity'

export interface RepositoryInterface<E extends Entity> {
  insert(entity: E): Promise<void>
  findById(id: string, companyId?: string, userId?: string): Promise<E>
  findAll(companyId?: string): Promise<E[]>
  update(entity: E): Promise<void>
  delete(id: string, companyId?: string, userId?: string): Promise<void>
  runInTransaction?<T>(fn: () => Promise<T>): Promise<T>
}

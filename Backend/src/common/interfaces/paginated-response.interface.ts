// src/common/interfaces/paginated-response.interface.ts
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    totalItems: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

export interface PaginationResponse {
  content: any[]
  page: PageInformation
}

export interface PageInformation {
  size: number,
  number: number,
  totalElements: number,
  totalPages: number,
}

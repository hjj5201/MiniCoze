export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreatePaginatedDataOptions<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function createPaginatedData<T>(
  options: CreatePaginatedDataOptions<T>,
): PaginatedData<T> {
  return {
    list: options.list,
    total: options.total,
    page: options.page,
    pageSize: options.pageSize,
  };
}

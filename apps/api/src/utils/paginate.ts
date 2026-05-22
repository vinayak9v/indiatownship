import { ParsedQs } from 'qs';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(query: ParsedQs): PaginationOptions {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit ?? '12'), 10)));
  return { page, limit, skip: (page - 1) * limit };
}

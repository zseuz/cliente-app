export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [filter: string]: string | number | undefined;
}

/** Forma de los errores que devuelve la API. */
export interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
  details?: unknown;
}

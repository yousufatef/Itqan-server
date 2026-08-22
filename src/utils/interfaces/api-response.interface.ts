export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message: string;
  errors: unknown[] | null;
  statusCode: number;
  result: T | null;
}

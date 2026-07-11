export interface ApiError extends Error {
  status: number;
  data?: unknown;
}

export function apiError(status: number, message: string, data?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.name = "ApiError";
  error.status = status;
  error.data = data;
  return error;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === "ApiError";
}

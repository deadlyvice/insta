export type ApiResponse<T = unknown> = 
  | { ok: true; data: T }
  | { ok: false; error: string };
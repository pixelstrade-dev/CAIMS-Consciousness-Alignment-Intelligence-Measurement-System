import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
    processingTimeMs?: number;
  };
}

export function apiSuccess<T>(data: T, status = 200, headers?: Record<string, string>): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    },
    { status, headers }
  );
}

export function apiError(
  code: string,
  message: string,
  status: number,
  headers?: Record<string, string>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
      meta: { timestamp: new Date().toISOString() },
    },
    { status, headers }
  );
}

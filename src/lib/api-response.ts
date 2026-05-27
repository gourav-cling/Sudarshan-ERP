import { NextResponse } from "next/server";

export type ApiResult<T> = { data: T; error: null } | { data: null; error: string };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null } satisfies ApiResult<T>, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json(
    { data: null, error: message } satisfies ApiResult<null>,
    { status }
  );
}

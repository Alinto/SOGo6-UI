import { NextResponse } from 'next/server'

/** Stub SSE pour démo /fakeApi (évite 404 quand la base URL est la fake API). */
export async function GET() {
  return new NextResponse('data: {"type":"ping"}\n\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

import { NextResponse, NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proxy API requests to FastAPI backend
  if (pathname.startsWith('/api/backend')) {
    const backendPath = pathname.replace('/api/backend', '')
    const backendUrl = new URL(backendPath, BACKEND_URL)

    // Copy search params
    request.nextUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value)
    })

    // Create new headers and forward Authorization
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-forwarded-host', request.nextUrl.host)

    return NextResponse.rewrite(backendUrl, {
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/backend/:path*',
}

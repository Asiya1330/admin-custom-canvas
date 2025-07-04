import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow access to login page and static assets
  if (pathname === '/login' || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/') || 
      pathname === '/favicon.ico') {
    return NextResponse.next()
  }
  
  // For all other pages, let the client-side handle authentication
  // The withAuth HOC will redirect to login if not authenticated
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 
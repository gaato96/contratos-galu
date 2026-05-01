import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('galu_auth')
  const { pathname } = request.nextUrl

  // Protected routes: Dashboard and internal pages
  const isProtectedRoute = pathname === '/' || pathname.startsWith('/contratos') || pathname.startsWith('/settings')
  
  // Public routes that should redirect if already logged in
  const isAuthRoute = pathname === '/login'

  if (isProtectedRoute && !authCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && authCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

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
     * - c (client portal)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|c|.*\\..*).*)',
  ],
}

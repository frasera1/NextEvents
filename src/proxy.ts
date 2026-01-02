import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const authToken = request.cookies.get('authToken')?.value
  
  const isPrivateRoute = pathname.includes('/user') || pathname.includes('/admin')
  const isPublicRoute = pathname === '/login' || pathname === '/register' || pathname === '/'

  // If private route and no token, redirect to login
  if (isPrivateRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If public route and has token, redirect to appropriate dashboard based on role
  if (isPublicRoute && authToken) {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret'
      const decoded = jwt.verify(authToken, secret) as any
      
      if (decoded.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/user/events', request.url))
      }
    } catch (error) {
      // Invalid token, allow to continue to public route
      return NextResponse.next()
    }
  }

  const response = NextResponse.next()
  
  // Add CSP headers to allow Stripe PaymentElement and React
  // Note: 'unsafe-inline' is required for Stripe's PaymentElement
  // React event handlers use event delegation and don't actually create inline handlers
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://*.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.stripe.com https://*.supabase.co wss://*.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
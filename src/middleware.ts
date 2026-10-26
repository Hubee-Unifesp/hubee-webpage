import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; 
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/cadastro'];
  const isPublicRoute = publicRoutes.includes(pathname);
  // Páginas de evento (/eventos e /eventos/[id]) são abertas a visitantes.
  const isPublicEventRoute = pathname === '/eventos' || pathname.startsWith('/eventos/');

  if (!token && !isPublicRoute && !isPublicEventRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
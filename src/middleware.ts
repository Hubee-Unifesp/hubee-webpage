import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; 
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/cadastro'];
  const isPublicRoute = publicRoutes.includes(pathname);
  // Páginas públicas abertas tanto a visitantes quanto a usuários autenticados.
  const isPublicEventRoute = pathname === '/eventos' || pathname.startsWith('/eventos/');
  const isOpenRoute = pathname === '/' || pathname === '/sobre' || isPublicEventRoute;

  if (!token && !isPublicRoute && !isOpenRoute) {
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

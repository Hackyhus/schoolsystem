
import { NextResponse, type NextRequest } from 'next/server';
import { admin } from './lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value || '';

  // If no session, continue. Let the page handle redirection.
  if (!session) {
    return NextResponse.next();
  }

  // Add the session cookie to the request headers for server components/actions to use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-session-cookie', session);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};


import { NextResponse } from 'next/server';
export function middleware(request) {
    const session = request.cookies.get('session')?.value;
    const { pathname } = request.nextUrl;

    const isProtected = pathname.startsWith('/dashboard');
    const isAuthRoute = pathname === '/login' || pathname === '/enroll';

    if (isProtected && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/enroll']
};

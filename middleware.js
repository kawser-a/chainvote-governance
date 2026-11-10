import { NextResponse } from 'next/server';

// Sends signed-out visitors to the right sign-in page and remembers where they
// were going, so they land back on that page after signing in.
function toSignIn(request, loginPath) {
    const url = new URL(loginPath, request.url);
    const { pathname, search } = request.nextUrl;
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
}

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Voter
    const voterSession = request.cookies.get('session')?.value;
    const isVoterProtected =
        pathname.startsWith('/dashboard') || pathname.startsWith('/elections') || pathname.startsWith('/petitions');
    const isVoterAuthRoute = pathname === '/login' || pathname === '/enroll';
    if (isVoterProtected && !voterSession) return toSignIn(request, '/login');
    if (isVoterAuthRoute && voterSession) return NextResponse.redirect(new URL('/dashboard', request.url));

    // Election officials
    const adminSession = request.cookies.get('admin_session')?.value;
    const isAdminLogin = pathname === '/admin/login';
    if (pathname.startsWith('/admin') && !isAdminLogin && !adminSession) return toSignIn(request, '/admin/login');
    if (isAdminLogin && adminSession) return NextResponse.redirect(new URL('/admin/dashboard', request.url));

    // Candidates
    const candSession = request.cookies.get('candidate_session')?.value;
    const isCandLogin = pathname === '/candidate/login';
    if (pathname.startsWith('/candidate') && !isCandLogin && !candSession) return toSignIn(request, '/candidate/login');
    if (isCandLogin && candSession) return NextResponse.redirect(new URL('/candidate/dashboard', request.url));

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*', '/elections/:path*', '/petitions/:path*', '/login', '/enroll',
        '/admin/:path*',
        '/candidate/:path*',
    ],
};

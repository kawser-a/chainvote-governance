
// import { NextResponse } from 'next/server';
// export function middleware(request) {
//     const session = request.cookies.get('session')?.value;
//     const { pathname } = request.nextUrl;

//     const isProtected = pathname.startsWith('/dashboard');
//     const isAuthRoute = pathname === '/login' || pathname === '/enroll';

//     if (isProtected && !session) {
//         return NextResponse.redirect(new URL('/login', request.url));
//     }
//     if (isAuthRoute && session) {
//         return NextResponse.redirect(new URL('/dashboard', request.url));
//     }
//     return NextResponse.next();
// }

// export const config = {
//     matcher: ['/dashboard/:path*', '/login', '/enroll']
// };


// import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';

// export function middleware(request) {
//     const { pathname } = request.nextUrl;

//     // voter session
//     const voterSession = request.cookies.get('session')?.value;
//     const isVoterProtected = pathname.startsWith('/dashboard');
//     const isVoterAuthRoute = pathname === '/login' || pathname === '/enroll';

//     if (isVoterProtected && !voterSession) {
//         return NextResponse.redirect(new URL('/login', request.url));
//     }
//     if (isVoterAuthRoute && voterSession) {
//         return NextResponse.redirect(new URL('/dashboard', request.url));
//     }

//     // admin session
//     const adminSession = request.cookies.get('admin_session')?.value;
//     const isAdminProtected = pathname.startsWith('/admin/dashboard');
//     const isAdminAuthRoute = pathname === '/admin/login';

//     if (isAdminProtected && !adminSession) {
//         return NextResponse.redirect(new URL('/admin/login', request.url));
//     }
//     if (isAdminAuthRoute && adminSession) {
//         return NextResponse.redirect(new URL('/admin/dashboard', request.url));
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: [
//         '/dashboard/:path*',
//         '/login',
//         '/enroll',
//         '/admin/dashboard/:path*',
//         '/admin/login'
//     ],
// };

import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // voter
    const voterSession = request.cookies.get('session')?.value;
    const isVoterProtected = pathname.startsWith('/dashboard');
    const isVoterAuthRoute = pathname === '/login' || pathname === '/enroll';
    if (isVoterProtected && !voterSession) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (isVoterAuthRoute && voterSession) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // admin
    const adminSession = request.cookies.get('admin_session')?.value;
    const isAdminProtected = pathname.startsWith('/admin') && pathname !== '/admin/login';
    const isAdminLogin = pathname === '/admin/login';
    if (isAdminProtected && !adminSession) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (isAdminLogin && adminSession) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // candidate
    const candSession = request.cookies.get('candidate_session')?.value;
    const isCandProtected = pathname.startsWith('/candidate') && pathname !== '/candidate/login';
    const isCandLogin = pathname === '/candidate/login';
    if (isCandProtected && !candSession) {
        return NextResponse.redirect(new URL('/candidate/login', request.url));
    }
    if (isCandLogin && candSession) {
        return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*', '/login', '/enroll',
        '/admin/:path*', '/admin/login',
        '/candidate/:path*', '/candidate/login'
    ],
};

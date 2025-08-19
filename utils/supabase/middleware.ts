import {createServerClient} from '@supabase/ssr';
import {type NextRequest, NextResponse} from 'next/server';

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({name, value}) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({name, value, options}) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: {session},
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error in middleware:', error.message);
    }

      // protect profile pages - check if user exists
      if (request.nextUrl.pathname.startsWith('/profile') && !session) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      if (request.nextUrl.pathname.startsWith('/reset-password') && !session) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

   

    // Förhindra inloggade användare (med aktiv session) från att komma åt autentiseringssidor
    if (
      (request.nextUrl.pathname === '/sign-in' ||
        request.nextUrl.pathname === '/sign-up' ||
        request.nextUrl.pathname === '/reset-password' ||
        request.nextUrl.pathname === '/forgot-password') &&
      session // Check if a session exists
    ) {
      return NextResponse.redirect(new URL('/profile', request.url)); // Redirect logged-in users away from auth pages
    }

    return response;
  } catch (e) {
    console.error('Middleware error:', e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};

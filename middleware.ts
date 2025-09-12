import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// Route protection is handled at page level with getServerSession()
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*  '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)', */
  ],
};

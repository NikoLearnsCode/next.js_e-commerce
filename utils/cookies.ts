import {cookies} from 'next/headers';
import {v4 as uuidv4} from 'uuid';

export const CART_SESSION_COOKIE = 'cart_session_id';

// Hämta session_id om den finns, utan att skapa en ny
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  return sessionId || null;
}

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

  if (sessionId) {
    return sessionId;
  }

  const newSessionId = uuidv4();
  cookieStore.set(CART_SESSION_COOKIE, newSessionId, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  console.log('newSessionId', newSessionId);

  return newSessionId;
}

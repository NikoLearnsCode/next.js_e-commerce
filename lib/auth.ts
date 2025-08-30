import {DrizzleAdapter} from '@auth/drizzle-adapter';
import {NextAuthOptions} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import {db} from '@/drizzle';
import {usersTable, accountsTable, sessionsTable} from '@/drizzle/db/schema';
import {transferCartOnLogin} from '@/actions/cart';
import {transferFavoritesOnLogin} from '@/actions/favorites';
import {CART_SESSION_COOKIE} from '@/utils/cookies';
import {cookies} from 'next/headers';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable,
    accountsTable,
    sessionsTable,
  }),
  session: {
    strategy: 'database',
    maxAge: 2 * 24 * 60 * 60, // 2 dagar
    updateAge: 24 * 60 * 60, // Förläng varje dag vid aktivitet
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  callbacks: {
    signIn: async ({user}) => {
      // Transfer cart when user signs in

      if (user?.id) {
        try {
          // Transfer both cart and favorites on login
          await Promise.all([
            transferCartOnLogin(user.id),
            transferFavoritesOnLogin(user.id),
          ]);
          const cookieStore = await cookies();
          cookieStore.delete(CART_SESSION_COOKIE);
        } catch (error) {
          console.error(
            'Error transferring cart and favorites on login:',
            error
          );
        }
      }
      return true;
    },
    session: async ({session, user}) => {
      if (session.user) {
        session.user.id = user.id;

        (session.user as any).role = (user as any).role;
      }
      // Returnerar det modifierade session-objektet
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    error: '/auth/error',
  },
};

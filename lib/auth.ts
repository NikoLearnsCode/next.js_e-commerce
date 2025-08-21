import {DrizzleAdapter} from '@auth/drizzle-adapter';
import {NextAuthOptions} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import {db} from '@/drizzle/src';
import {
  usersTable,
  accountsTable,
  sessionsTable,
} from '@/drizzle/src/db/schema';
import {transferCartOnLogin} from '@/actions/cart';
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
      console.log('signIn callback - user:', user);
      console.log('signIn callback - user.id:', user?.id);
      if (user?.id) {
        try {
          await transferCartOnLogin(user.id);
          const cookieStore = await cookies();
          cookieStore.delete(CART_SESSION_COOKIE);
          console.log('Cart transferred successfully for user:', user.id);
        } catch (error) {
          console.error('Error transferring cart on login:', error);
        }
      }
      return true;
    },

    session: async ({session, user}) => {
      if (session.user) {
        session.user.id = user.id;

        (session.user as any).role = (user as any).role;
      }

      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    error: '/auth/error',
  },
};

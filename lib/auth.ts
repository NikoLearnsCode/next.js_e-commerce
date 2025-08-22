import {DrizzleAdapter} from '@auth/drizzle-adapter';
import {NextAuthOptions} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import {db} from '@/drizzle';
import {
  usersTable,
  accountsTable,
  sessionsTable,
} from '@/drizzle/db/schema';
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
      // Transfer cart when user signs in

      if (user?.id) {
        try {
          await transferCartOnLogin(user.id);
          const cookieStore = await cookies();
          cookieStore.delete(CART_SESSION_COOKIE);
        } catch (error) {
          console.error('Error transferring cart on login:', error);
        }
      }
      return true;
    },
    // Denna callback körs varje gång en session hämtas (t.ex. av useSession).
    session: async ({session, user}) => {
      // 1. `user`-objektet kommer direkt från din databas (via DrizzleAdapter).
      //    Det innehåller alla fält från din `usersTable`, inklusive `id` och `role`.

      // 2. Vi ser till att `session.user` inte är null.
      if (session.user) {
        // 3. Vi kopierar `id` från databas-`user` till `session.user`.
        //    Det är DETTA som gör att `session.user.id` kommer finnas i din `useAuth`-hook.
        session.user.id = user.id;

        // 4. Vi kopierar också `role` från databas-`user` till `session.user`.
        //    Nu kommer `session.user.role` att vara tillgänglig i din `useAuth`-hook.
        (session.user as any).role = (user as any).role;
      }

      // 5. Returnera det modifierade session-objektet.
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    error: '/auth/error',
  },
};

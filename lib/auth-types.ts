import {DefaultSession} from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: number;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid: string;
    role: number;
  }
}

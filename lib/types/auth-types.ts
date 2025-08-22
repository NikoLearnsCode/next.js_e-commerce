import {DefaultSession} from 'next-auth';
import {DefaultJWT} from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: number;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: number;
  }
}

export type AdapterAccount = {
  type: 'oauth' | 'oidc' | 'email';
};

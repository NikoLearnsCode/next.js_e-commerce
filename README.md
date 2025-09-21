### 1\. Databas-setup

- Ladda ner och installera [PostgreSQL](https://www.postgresql.org/download/).
- Skapa databasen i din terminal:
  ```bash
  createdb 'ditt-databasnamn'
  ```

### 2\. Konfigurera miljövariabler (`.env`)

- Skapa en `.env`-fil från `.env-example`.

- Fyll i alla värden i `.env`-filen.

  ```ini
  # NextAuth
  NEXTAUTH_SECRET= # t.ex. generera i terminalen: openssl rand -base64 32
  NEXTAUTH_URL=http://localhost:3000

  # PostgreSQL
  DB_HOST=
  DB_PORT=
  DB_USER=
  DB_PASSWORD=  # ange eller ta bort password: process.env.DB_PASSWORD!, från /drizzle/index.ts.
  DB_NAME=
  ```

### 3\. Konfigurera OAuth (Valfritt)

Följ stegen nedan för att aktivera inloggning och klistra in nycklarna i din `.env`-fil.

#### Google OAuth

1.  Gå till [Google Cloud Console](https://console.cloud.google.com/) och skapa ett nytt OAuth 2.0 Client ID.
2.  Ange `Web application` som applikationstyp.
3.  Lägg till `http://localhost:3000/api/auth/callback/google` som en `Authorized redirect URI`.
4.  Kopiera `GOOGLE_CLIENT_ID` och `GOOGLE_CLIENT_SECRET` till din `.env`-fil.

#### GitHub OAuth

1.  Gå till [GitHub Developer Settings](https://github.com/settings/developers) och skapa en ny OAuth App.
2.  Ange `http://localhost:3000/api/auth/callback/github` som `Authorization callback URL`.
3.  Kopiera `GITHUB_ID` och `GITHUB_SECRET` till din `.env`-fil.

### 4\. Kör installation & seeding

```bash
npm i
npm run db:push
npm run seed:c
npm run seed:p
```

```bash
npm run db:studio --- dashboard
```

### 5\. Tillfällig Admin-åtkomst

För att komma åt `/admin` utan inloggning/role, kommentera bort följande rader i `/app/admin/layout.tsx`:

```tsx
/*
const session = await getServerSession(authOptions);
if (session?.user.role !== 1) {
  return redirect('/denied');
} 
*/
```

import {createBrowserClient} from '@supabase/ssr';

// Skapa en singleton-instans av Supabase-klienten för att undvika flera instanser
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
};

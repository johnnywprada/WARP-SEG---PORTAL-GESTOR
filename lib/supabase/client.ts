// lib/supabase/client.ts
    
// Importa o cliente CORRETO para uso no Next.js (SSR)
import { createBrowserClient } from '@supabase/ssr'

// O Next.js lê essas variáveis do seu arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cria e exporta o cliente Supabase. Esta função sabe como lidar com o token de sessão.
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);
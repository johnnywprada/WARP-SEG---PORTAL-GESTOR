// app/test-db/page.tsx

'use client'; 

import React, { useState, useEffect } from 'react';
// Caminho corrigido para a extensão .ts e usando a navegação relativa
import { supabase } from '../../lib/supabase/client'; 

// Adicione este import para corrigir o erro de tipo (se o erro voltar a aparecer)
import type { PostgrestError } from '@supabase/supabase-js';


// -------------------------------------------------------------------
// Componente Auxiliar para buscar os dados
// -------------------------------------------------------------------
function FetchDataComponent() {
  // Define os estados
  const [clientes, setClientes] = useState<any[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getClientes() {
      try {
        const { data, error } = await supabase
          .from("clientes")
          .select();

        if (error) {
          setError(error);
        } else {
          setClientes(data);
        }
      } catch (err) {
        // Agora, se o erro for capturado, ele será aceito pelo TypeScript
        setError(err as PostgrestError); 
      } finally {
        setLoading(false);
      }
    }
    getClientes();
  }, []);

  if (loading) {
    return <p>Carregando dados do Supabase...</p>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Erro na Conexão com Supabase!</h1>
        <p>Verifique as chaves em .env.local ou a política RLS:</p>
        <pre>{error.message}</pre>
      </div>
    );
  }

  // Se funcionar, mostra os dados formatados
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>✅ Conexão BEM SUCEDIDA!</h1>
      <p>Clientes Encontrados no Banco de Dados:</p>
      <pre>{JSON.stringify(clientes, null, 2)}</pre>
    </div>
  );
}

// -------------------------------------------------------------------
// O Componente Principal da Página
// -------------------------------------------------------------------
export default function TesteSupabasePage() {
    return (
        <FetchDataComponent />
    );
}
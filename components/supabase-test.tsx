// components/supabase-test.tsx
"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function SupabaseTest() {
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Iniciando teste de fetch...");
        const testFetch = async () => {
            const { data, error } = await supabase.from('clientes').select('*').limit(1);
            console.log("Resposta do Supabase:", { data, error });
            setResult(data);
            setError(error);
            setLoading(false);
        };
        testFetch();
    }, []);

    if (loading) {
        return <div className="p-8">Testando conexão com o Supabase...</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', background: '#111', color: '#eee', minHeight: '100vh' }}>
            <h2>Resultado do Teste de Conexão Supabase</h2>
            <hr style={{ margin: '20px 0' }} />

            <h3 style={{ color: '#ff4d4d' }}>Erro Recebido:</h3>
            <pre style={{ border: '1px solid #ff4d4d', padding: '10px', background: '#222', borderRadius: '5px' }}>
                {error ? JSON.stringify(error, null, 2) : 'Nenhum erro! (Isso é bom)'}
            </pre>

            <h3 style={{ color: '#50fa7b' }}>Dados Recebidos:</h3>
            <pre style={{ border: '1px solid #50fa7b', padding: '10px', background: '#222', borderRadius: '5px' }}>
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
}
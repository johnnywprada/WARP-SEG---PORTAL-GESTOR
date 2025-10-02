// app/login/page.tsx

'use client'; 

import { LoginForm } from "@/components/login-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    // Verifica a sessão atual para ver se o usuário JÁ está logado
    useEffect(() => {
        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Se o usuário está logado, redireciona para a página principal (dashboard)
                router.push('/'); 
            } else {
                setIsLoading(false);
            }
        }
        checkSession();
    }, [router]);

    // Função de sucesso de login
    const handleSuccessfulLogin = () => {
        // Após o login no formulário, redireciona para a página principal
        router.push('/');
    };

    if (isLoading) {
        // Opcional: Mostra uma tela de carregamento enquanto verifica a sessão
        return <div className="min-h-screen flex items-center justify-center">Verificando sessão...</div>;
    }

    // Exibe o seu formulário de login
    return <LoginForm onLogin={handleSuccessfulLogin} />;
}
// ADICIONE O IMPORT DO SUPABASE NO TOPO (se ainda não estiver lá)
"use client"

import { supabase } from '@/lib/supabase/client';
import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

interface LoginFormProps {
  onLogin: () => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  // Mude 'username' para 'email' (Padrão do Supabase)
  const [email, setEmail] = useState("") 
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // FUNÇÕES ANTIGAS REMOVIDAS:
  // getValidPassword e VALID_CREDENTIALS são removidas, pois o Supabase as gerencia.
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validação básica dos campos
    if (!email || !password) {
        setError("Preencha todos os campos.");
        setIsLoading(false);
        return;
    }

    // --- NOVA LÓGICA DE AUTENTICAÇÃO SUPABASE ---

    // 1. Tenta fazer login com e-mail e senha
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });
    
    // 2. Verifica o resultado
    if (signInError) {
      // O Supabase retorna um erro se as credenciais estiverem incorretas
      setError("Usuário ou senha incorretos"); 
      
      // O Supabase gerencia a sessão, então não precisamos do localStorage.setItem
      
    } else {
      // Login BEM-SUCEDIDO! O Supabase salva a sessão automaticamente (token)
      onLogin(); 
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <Image
              src="/images/warp-logo.png"
              alt="WARP Segurança Eletrônica"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <div className="flex justify-center">
            <div className="bg-red-50 p-3 rounded-full">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Acesso Restrito</CardTitle>
          <CardDescription className="text-slate-600">
            Sistema de Gestão de Clientes
            <br />
            <span className="text-sm font-medium text-red-600">Apenas funcionários autorizados</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email de Usuário
              </Label>
              <Input
                id="email"
                type="email" // Mude o tipo para email
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email de usuário"
                required
                className="border-slate-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="border-slate-300 focus:border-red-500 focus:ring-red-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center space-x-2">
              <Image src="/images/warp-mascot.png" alt="Mascote WARP" width={32} height={32} className="h-8 w-8" />
              <p className="text-xs text-slate-500 text-center">WARP Segurança Eletrônica - Gestão Interna</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
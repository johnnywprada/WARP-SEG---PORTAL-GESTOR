// ADICIONE O IMPORT DO SUPABASE NO TOPO
"use client"

import { supabase } from '@/lib/supabase/client'; 
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"

interface ChangePasswordProps {
  onBack: () => void
}

export function ChangePassword({ onBack }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // FUNÇÃO ANTIGA REMOVIDA:
  // A função getCurrentPassword() não é mais necessária, pois o Supabase gerencia a senha atual.
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    // 1. Validação de campos e regras básicas (Validações de UI)
    if (newPassword.length < 6) {
        setError("A nova senha deve ter pelo menos 6 caracteres");
        setIsLoading(false);
        return;
    }
    if (newPassword !== confirmPassword) {
        setError("A confirmação da nova senha não confere");
        setIsLoading(false);
        return;
    }
    if (newPassword === currentPassword) {
        setError("A nova senha deve ser diferente da atual");
        setIsLoading(false);
        return;
    }
    
    // --- LÓGICA SUPABASE PARA ALTERAR SENHA ---

    // 2. Tenta obter as informações do usuário logado (Supabase Session)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        setError("Sessão expirada. Por favor, faça o login novamente para alterar a senha.");
        setIsLoading(false);
        return;
    }
    
    // 3. Valida a SENHA ATUAL: Tenta fazer login com a senha antiga.
    // Isso garante que apenas o usuário logado possa alterar a senha.
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    });

    if (signInError) {
        // A senha atual está incorreta
        setError("Senha atual incorreta. (Verificação falhou)");
        setIsLoading(false);
        return;
    }
    
    // 4. Altera a Senha: Se a senha atual for válida, faz a atualização no Supabase.
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (updateError) {
        // Erro do Supabase, como nova senha ser igual à antiga.
        setError(`Erro ao atualizar: ${updateError.message}`);
    } else {
        // 5. Sucesso!
        setSuccess(true);
        
        // Limpar campos
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Voltar automaticamente após 2 segundos
        setTimeout(() => {
          onBack(); 
        }, 2000);
    }
    
    // --- FIM DA LÓGICA SUPABASE ---

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <Image
              src="/images/warp-logo.png"
              alt="WARP Segurança Eletrônica"
              width={708}
              height={256}
              quality={100}
              className="h-12 w-auto"
            />
          </div>
          <div className="flex justify-center">
            <div className="bg-red-50 p-3 rounded-full">
              <KeyRound className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Alterar Senha</CardTitle>
          <CardDescription className="text-slate-600">Altere sua senha de acesso ao sistema</CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-700">Senha alterada com sucesso!</h3>
                <p className="text-sm text-slate-600 mt-2">Redirecionando...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-slate-700 font-medium">
                  Senha Atual
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    required
                    className="border-slate-300 focus:border-red-500 focus:ring-red-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-700 font-medium">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                    required
                    minLength={6}
                    className="border-slate-300 focus:border-red-500 focus:ring-red-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                    required
                    className="border-slate-300 focus:border-red-500 focus:ring-red-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={onBack}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Alterando..." : "Alterar Senha"}
                </Button>
              </div>
            </form>
          )}

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
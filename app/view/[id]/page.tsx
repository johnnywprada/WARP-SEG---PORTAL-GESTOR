"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { SavedBudgetPreview } from "@/components/saved-budget-preview"
// Importe o seu tipo correto de SavedBudget. Ajuste o caminho se necessário.
import { type SavedBudget } from "@/lib/types" 

export default function PublicBudgetView({ params }: { params: { id: string } }) {
  const [budget, setBudget] = useState<SavedBudget | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchPublicBudget() {
      try {
        // Chamamos a função segura no banco de dados, não a tabela diretamente
        const { data, error } = await supabase
          .rpc('get_orcamento_publico', { p_id: params.id })
          .single()

        if (error || !data) throw new Error("Orçamento não encontrado")
        
        setBudget(data as SavedBudget)
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchPublicBudget()
    }
  }, [params.id])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Carregando documento...</div>
  }

  if (error || !budget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-slate-200 max-w-md w-full">
          <h2 className="text-xl font-bold text-destructive mb-2">Documento Indisponível</h2>
          <p className="text-sm text-slate-500">Este link é inválido ou o orçamento foi removido do sistema.</p>
        </div>
      </div>
    )
  }

  // Reaproveita a estrutura de impressão existente.
  return (
    <div className="public-view-wrapper">
      {/* Removemos os botões de ação e controle da visualização do cliente final */}
      <style dangerouslySetInnerHTML={{__html: `
        .public-view-wrapper .sticky.top-0 { display: none !important; }
      `}} />
      
      <SavedBudgetPreview 
        budget={budget} 
        onBack={() => {}} 
        onViewBudgetList={() => {}} 
      />
    </div>
  )
}
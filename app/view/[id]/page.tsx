"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { SavedBudgetPreview } from "@/components/saved-budget-preview" // ajuste o caminho se necessário
import { type SavedBudget } from "@/lib/types" // ajuste a tipagem

export default function PublicBudgetView({ params }: { params: { id: string } }) {
  const [budget, setBudget] = useState<SavedBudget | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBudget() {
      try {
        const { data, error } = await supabase
          .rpc('get_budget_publico', { p_id: params.id }) // Assumindo que você criou essa RPC
          .single()

        if (error) throw error;
        if (data) setBudget(data as SavedBudget) 
      } catch (error) {
        console.error("Erro ao buscar orçamento:", error)
      } finally {
        setIsLoading(false)
      }
    }
        
    fetchBudget()
  }, [params.id])

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-600">Carregando Orçamento...</div>
  if (!budget) return <div className="p-10 text-center font-bold text-destructive">Orçamento não encontrado ou indisponível.</div>

  // AQUI ESTÁ A CORREÇÃO:
  // 1. Removido o <style> com display:none
  // 2. Chamando o componente SEM passar as funções onBack ou onViewBudgetList
  return (
    <div className="public-budget-wrapper">
      <SavedBudgetPreview budget={budget} />
    </div>
  )
}
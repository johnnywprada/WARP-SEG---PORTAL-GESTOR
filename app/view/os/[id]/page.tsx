"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { SavedServiceOrderPreview } from "@/components/saved-service-order-preview"
import { type SavedServiceOrder } from "@/lib/types"

export default function PublicOSView({ params }: { params: { id: string } }) {
  const [os, setOs] = useState<SavedServiceOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchOS() {
      try {
        const { data, error } = await supabase
          .rpc('get_os_publica', { p_id: params.id })
          .single()

        if (error) {
          console.error("Erro ao buscar OS pública:", error)
          return
        }
        
        if (data) {
          setOs(data as SavedServiceOrder) 
        }
      } catch (error) {
        console.error("Exceção inesperada ao buscar OS:", error)
      } finally {
        // A regra de ouro: independentemente de sucesso ou falha, o loading PRECISA acabar.
        setIsLoading(false)
      }
    }
        
    fetchOS()
  }, [params.id])

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-600">Carregando Ordem de Serviço...</div>
  if (!os) return <div className="p-10 text-center font-bold text-destructive">Ordem de Serviço não encontrada ou indisponível.</div>

  return (
    <div className="public-os-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .public-os-wrapper .sticky { display: none !important; }
      `}} />
      <SavedServiceOrderPreview serviceOrder={os} onBack={() => {}} />
    </div>
  )
}
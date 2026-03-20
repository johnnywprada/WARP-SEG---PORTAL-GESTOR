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
      const { data, error } = await supabase
        .rpc('get_os_publica', { p_id: params.id })
        .single()

      if (!error && data) 
        setOs(data as SavedServiceOrder) 
        }
        
    fetchOS()
  }, [params.id])

  if (isLoading) return <div className="p-10 text-center">Carregando Ordem de Serviço...</div>
  if (!os) return <div className="p-10 text-center text-red-500">Ordem de Serviço não encontrada.</div>

  return (
    <div className="public-os-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .public-os-wrapper .sticky { display: none !important; }
      `}} />
      <SavedServiceOrderPreview serviceOrder={os} onBack={() => {}} />
    </div>
  )
}
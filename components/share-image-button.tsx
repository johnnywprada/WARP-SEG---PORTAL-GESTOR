"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Loader2, Printer } from "lucide-react"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"

interface DocumentActionsProps {
  targetId: string
  fileName: string
  shareTitle: string
  shareText: string
  className?: string
}

export function DocumentActions({ 
  targetId, 
  fileName, 
  shareTitle, 
  shareText,
  className 
}: DocumentActionsProps) {
  const [loadingShare, setLoadingShare] = useState(false)
  const [loadingPrint, setLoadingPrint] = useState(false)

  // --- GERADOR DE ALTA RESOLUÇÃO (Mantido) ---
  const generateHighResData = async () => {
    const originalElement = document.getElementById(targetId)
    if (!originalElement) throw new Error(`Elemento '${targetId}' não encontrado.`)

    const clone = originalElement.cloneNode(true) as HTMLElement
    const ghostContainer = document.createElement('div')
    
    ghostContainer.style.position = 'fixed'
    ghostContainer.style.top = '-9999px'
    ghostContainer.style.left = '-9999px'
    ghostContainer.style.width = '1240px' 
    ghostContainer.style.zIndex = '-1'
    
    ghostContainer.appendChild(clone)
    document.body.appendChild(ghostContainer)

    clone.style.width = '100%'
    clone.style.height = 'auto'
    clone.style.minHeight = '1754px'
    clone.style.maxWidth = 'none'
    clone.style.backgroundColor = '#ffffff'
    clone.style.padding = '40px'
    clone.style.margin = '0'
    clone.style.border = 'none'

    try {
      const dataUrl = await toPng(clone, { 
        cacheBust: true,
        quality: 1.0,
        pixelRatio: 3, 
        backgroundColor: "#ffffff",
      })
      return dataUrl
    } finally {
      document.body.removeChild(ghostContainer)
    }
  }

  // --- BOTÃO 1: COMPARTILHAR PDF (Versão Blindada) ---
  const handleSharePDF = async () => {
    setLoadingShare(true)
    try {
      const imgData = await generateHighResData()
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      const pdfBlob = pdf.output('blob')

      // TRUQUE 1: Adicionar lastModified (Android gosta disso)
      const file = new File([pdfBlob], `${fileName}.pdf`, { 
        type: 'application/pdf',
        lastModified: new Date().getTime()
      })

      if (navigator.share) {
        try {
            // TENTATIVA 1: Pacote Completo (PDF + Texto)
            await navigator.share({
                files: [file],
                title: shareTitle,
                text: shareText
            })
        } catch (error: any) {
            // Se o usuário cancelou, paramos aqui
            if (error.name === 'AbortError') {
                setLoadingShare(false)
                return
            }

            // TENTATIVA 2: Só o PDF (Estratégia "Manda logo")
            // Muitos Androids falham ao receber texto junto com arquivo
            try {
                console.log("Tentando enviar apenas o arquivo...")
                await navigator.share({
                    files: [file],
                    title: shareTitle
                })
            } catch (retryError) {
                console.log("Share nativo falhou totalmente. Iniciando download.", retryError)
                // Se tudo falhar, aí sim fazemos o download
                pdf.save(`${fileName}.pdf`)
            }
        }
      } else {
        // Fallback para PC
        pdf.save(`${fileName}.pdf`)
      }

    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("Erro ao gerar o documento.")
    } finally {
      setLoadingShare(false)
    }
  }

  // --- BOTÃO 2: IMPRIMIR (Mantido) ---
  const handlePrint = async () => {
    setLoadingPrint(true)
    try {
      const dataUrl = await generateHighResData()
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)

      const content = `
        <html>
          <head><title>${fileName}</title></head>
          <body style="margin:0; display:flex; justify-content:center;">
            <img src="${dataUrl}" style="width:100%; max-width:210mm;" onload="window.print();" />
          </body>
        </html>
      `
      const doc = iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(content)
        doc.close()
        setTimeout(() => { document.body.removeChild(iframe) }, 5000) 
      }
    } catch (error) {
      console.error("Erro na impressão:", error)
    } finally {
      setLoadingPrint(false)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant="outline" 
        onClick={handleSharePDF} 
        disabled={loadingShare || loadingPrint}
        className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
      >
        {loadingShare ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
        <span className="hidden sm:inline">{loadingShare ? 'Gerando PDF...' : 'Compartilhar'}</span>
        <span className="sm:hidden">{loadingShare ? '...' : 'Compartilhar'}</span>
      </Button>

      <Button 
        onClick={handlePrint} 
        disabled={loadingShare || loadingPrint}
        className="gap-2 bg-destructive hover:bg-destructive/90"
      >
        {loadingPrint ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
        <span className="hidden sm:inline">{loadingPrint ? 'Preparando...' : 'Imprimir'}</span>
        <span className="sm:hidden">{loadingPrint ? '...' : 'Salvar PDF'}</span>
      </Button>
    </div>
  )
}
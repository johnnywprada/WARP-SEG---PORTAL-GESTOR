"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer, MessageCircle } from "lucide-react"
import Image from "next/image"
import { DocumentFooter } from "./DocumentFooter"
import { formatStructuredService } from "@/lib/serviceUtils"
import { type SavedServiceOrder } from "@/lib/types"

const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";
const brandIcon = process.env.NEXT_PUBLIC_BRAND_ICON || "/images/warpicon.png";

interface SavedServiceOrderPreviewProps {
  serviceOrder: SavedServiceOrder;
  onBack?: () => void;
}

const statusLabels = { agendado: "Agendado", "em-andamento": "Em Andamento", concluido: "Concluído", cancelado: "Cancelado" };
const statusColors = { agendado: "bg-yellow-100 text-yellow-800 border-yellow-200", "em-andamento": "bg-blue-100 text-blue-800 border-blue-200", concluido: "bg-green-100 text-green-800 border-green-200", cancelado: "bg-destructive/20 text-red-800 border-destructive/40" };

export function SavedServiceOrderPreview({ serviceOrder, onBack }: SavedServiceOrderPreviewProps) {
  const osNumber = serviceOrder.osnumber || 'N/A';

  const formattedAgendamento = serviceOrder.scheduleddate
    ? new Date(serviceOrder.scheduleddate).toLocaleString("pt-BR", {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : 'A Definir';

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `OS ${osNumber}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  }

  const handleWhatsAppShare = () => {
    const publicUrl = `${window.location.origin}/view/os/${serviceOrder.id}`; // Ajuste a rota se necessário
    const text = `Olá ${serviceOrder.cliente_nome}, tudo bem?\n\nAqui está o link para visualização da sua Ordem de Serviço da ${brandName}:\n\n${publicUrl}\n\nQualquer dúvida, estamos à disposição.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans w-full overflow-x-hidden print:overflow-x-visible print:bg-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* BARRA DE CONTROLE RESPONSIVA */}
      <div className="sticky top-0 bg-white border-b shadow-sm z-50 p-4 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="gap-2 w-full sm:w-auto text-destructive border-destructive/40 hover:bg-destructive/10">
              <ArrowLeft className="h-4 w-4" /> Voltar para a Lista
            </Button>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button onClick={handleWhatsAppShare} className="gap-2 bg-green-600 hover:bg-green-700 text-white border-none shadow-sm w-full sm:w-auto">
              <MessageCircle className="h-4 w-4" /> Enviar O.S
            </Button>
            <Button onClick={handlePrint} className="gap-2 bg-destructive hover:bg-destructive/90 text-white shadow-sm w-full sm:w-auto">
              <Printer className="h-4 w-4" /> Imprimir / PDF
            </Button>
          </div>
        </div>
      </div>

      {/* VIEWPORT VIRTUAL (Centralizado no PC e com scroll perfeito no celular) */}
      <div className="flex-grow py-4 sm:py-8 w-full overflow-x-auto print:overflow-x-visible px-2 sm:px-0 pb-8">
        
        {/* A Tabela (Folha A4) */}
        <div className="w-full min-w-[650px] max-w-[210mm] mx-auto bg-white shadow-xl p-6 sm:p-12 print:p-0 print:shadow-none print:max-w-none print:w-full print:block box-border">
          <table className="w-full border-collapse">
            <thead className="table-header-group">
              <tr>
                <td className="pb-4 border-b-2" style={{ borderBottomColor: "#dc2626" }}>
                  <div className="flex justify-between items-end pt-2 gap-4">
                    <div className="flex justify-start">
                      {brandLogo && <Image src={brandLogo} alt="Logo" width={400} height={150} className="h-12 w-auto object-contain print:h-12" priority />}
                    </div>
                    <div className="text-right">
                      <h1 className="text-2xl font-bold uppercase" style={{ color: "#dc2626" }}>Ordem de Serviço</h1>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <p className="font-bold text-base">Nº {osNumber}</p>
                        <Badge className={`${statusColors[serviceOrder.status as keyof typeof statusColors]} border-none px-2 py-0 h-5 text-xs`}>
                          {statusLabels[serviceOrder.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="py-6">
                  {/* DADOS DO CLIENTE */}
                  <div className="grid grid-cols-2 gap-8 mb-6 border-b border-gray-100 pb-4 break-inside-avoid">
                    <div>
                      <h3 className="text-[10pt] font-bold uppercase mb-1" style={{ color: "#dc2626" }}>Cliente</h3>
                      <p className="font-bold text-sm uppercase break-words">{serviceOrder.cliente_nome}</p>
                      <p className="text-xs text-gray-600 leading-tight mt-1">{serviceOrder.cliente_endereco}</p>
                    </div>
                    <div className="text-right text-xs space-y-1">
                      <p><strong>Emissão:</strong> {new Date(serviceOrder.created_at).toLocaleDateString("pt-BR")}</p>
                      <p><strong>Agendamento:</strong> {formattedAgendamento}</p>
                      <p><strong>Tipo:</strong> {formatStructuredService(serviceOrder.servicetype)}</p>
                    </div>
                  </div>

                  {/* DESCRIÇÃO DO SERVIÇO */}
                  <div className="mb-4 break-inside-avoid">
                    <h3 className="text-[10pt] font-bold uppercase mb-1" style={{ color: "#dc2626" }}>Descrição do Serviço</h3>
                    <div className="p-3 border rounded bg-slate-50/50 min-h-[4rem] text-[10pt] whitespace-pre-wrap break-words" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>
                      {serviceOrder.description || "Nenhuma descrição detalhada fornecida."}
                    </div>
                  </div>

                  {/* OBSERVAÇÕES */}
                  {serviceOrder.observations && (
                    <div className="mb-6 break-inside-avoid">
                      <h3 className="text-[10pt] font-bold uppercase mb-1 text-gray-600">Observações Adicionais</h3>
                      <div className="p-3 border border-gray-200 rounded text-[9pt] italic text-gray-700 whitespace-pre-wrap break-words">
                        {serviceOrder.observations}
                      </div>
                    </div>
                  )}

                  {/* RELATÓRIO DE EXECUÇÃO INTACTO */}
                  <div className="mb-8 break-inside-avoid">
                    <h3 className="text-[10pt] font-bold uppercase mb-2" style={{ color: "#dc2626" }}>Relatório Técnico de Execução</h3>
                    <div className="relative border rounded overflow-hidden" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>
                      <div className="absolute inset-0 flex flex-col pointer-events-none print:flex">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="w-full border-b border-dotted" style={{ height: "1.8rem", borderBottomColor: "rgba(220, 38, 38, 0.25)" }} />
                        ))}
                      </div>
                      <div className="relative p-2 min-h-[10.8rem] leading-[1.69rem] text-[9pt] whitespace-pre-wrap z-10 break-words">
                        {serviceOrder.relatorio_tecnico || ""}
                      </div>
                    </div>
                  </div>

                  {/* ASSINATURAS (Agora com margens reduzidas no print para não pular a página) */}
                  <div className="print:break-inside-avoid">
                    <div className="grid grid-cols-2 gap-12 mt-8 mb-10 print:mt-4 print:mb-4">
                      <div className="text-center w-full">
                        <div className="border-b border-black h-12 print:h-8 mb-2"></div>
                        <p className="text-[9pt] font-bold uppercase">Técnico ({brandName})</p>
                      </div>
                      <div className="text-center w-full">
                        <div className="border-b border-black h-12 print:h-8 mb-2"></div>
                        <p className="text-[9pt] font-bold uppercase break-words">Assinatura do Cliente</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end gap-4 px-4 py-4 border-t border-gray-100 print:py-2 print:px-0 print:mt-2">
                      <div className="w-1/3"></div>
                      <div className="w-1/3 flex justify-center">
                        {brandIcon && <Image src={brandIcon} alt="Icon" width={40} height={40} className="h-8 w-auto object-contain opacity-60 print:h-8" />}
                      </div>
                      <div className="w-1/3 text-right">
                        <p className="text-[10pt] font-bold text-gray-500">
                          DATA: <span className="text-gray-300">_____ / _____ / _________</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>

            {/* TFOOT: Rodapé Corrigido */}
            <tfoot className="table-footer-group">
              <tr>
                <td className="pt-4">
                  <div className="mt-4 print:mt-2 w-full">
                    <DocumentFooter />
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
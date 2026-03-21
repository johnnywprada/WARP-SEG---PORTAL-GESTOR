"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer, MessageCircle } from "lucide-react"
import Image from "next/image"
import { DocumentFooter } from "./DocumentFooter"

// --- Variáveis de Ambiente ---
const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";

interface Product { id: string; description: string; quantity: number; unit: string; unitPrice: number; total: number; }
interface ClientData { name: string; address: string; phone: string; email: string; }
interface SavedBudget {
  id: string; budgetNumber: string; client: ClientData; products: Product[]; paymentMethod: string;
  observations: string; validUntil: string; totalValue: number;
  status: "em-aberto" | "instalando" | "concluido" | "cancelado"; created_at: string;
}

interface SavedBudgetPreviewProps { 
  budget: SavedBudget; 
  onBack?: () => void; 
  onViewBudgetList?: () => void; 
}

const statusLabels = { "em-aberto": "Em Aberto", instalando: "Instalando", concluido: "Concluído", cancelado: "Cancelado" };
const statusColors = { "em-aberto": "bg-yellow-100 text-yellow-800 border-yellow-200", instalando: "bg-blue-100 text-blue-800 border-blue-200", concluido: "bg-green-100 text-green-800 border-green-200", cancelado: "bg-destructive/20 text-red-800 border-destructive/40" };

export function SavedBudgetPreview({ budget, onBack, onViewBudgetList }: SavedBudgetPreviewProps) {
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `ORÇAMENTO ${budget.budgetNumber}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  }

  const handleWhatsAppShare = () => {
    const publicUrl = `${window.location.origin}/view/${budget.id}`;
    const text = `Olá ${budget.client.name}, tudo bem?\n\nAqui está o link seguro para visualização e download do seu orçamento da ${brandName}:\n\n${publicUrl}\n\nQualquer dúvida, estou à disposição.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }

  return (
    <div 
    className="min-h-screen bg-slate-100 flex flex-col font-sans w-full overflow-x-hidden print:overflow-x-visible print:bg-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* BARRA DE CONTROLE RESPONSIVA */}
      <div className="sticky top-0 bg-white border-b shadow-sm z-50 p-4 print:hidden">
        {onViewBudgetList ? (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <Button variant="outline" onClick={onViewBudgetList} className="gap-2 w-full sm:w-auto text-destructive border-destructive/40 hover:bg-destructive/10">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button onClick={handleWhatsAppShare} className="gap-2 bg-green-600 hover:bg-green-700 text-white border-none shadow-sm w-full sm:w-auto">
                <MessageCircle className="h-4 w-4" /> Enviar
              </Button>
              <Button onClick={handlePrint} className="gap-2 bg-destructive hover:bg-destructive/90 text-white shadow-sm w-full sm:w-auto">
                <Printer className="h-4 w-4" /> Imprimir
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold">W</div>
              <span className="font-semibold text-gray-700 text-sm sm:text-base">Orçamento {budget.budgetNumber}</span>
            </div>
            <Button onClick={handlePrint} className="gap-2 bg-destructive hover:bg-destructive/90 text-white shadow-sm">
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
          </div>
        )}
      </div>

      {/* ÁREA DE VISUALIZAÇÃO RESPONSIVA */}
      {/* CORREÇÃO: px-3 no mobile para dar respiro, justificando conteúdo */}
      <div className="flex-grow py-4 sm:py-8 px-3 sm:px-4 flex justify-center print:p-0 print:m-0 print:block w-full">

        {/* CORREÇÃO PRINCIPAL: 
           1. w-full e max-w-full no mobile para garantir que não vase
           2. box-border para garantir que paddings não estiquem o container
           3. overflow-hidden/auto interno para capturar vazamentos de tabela
        */}
        <div className="bg-white shadow-xl w-full max-w-full sm:max-w-[210mm] p-4 sm:p-8 md:p-12 print:p-0 print:shadow-none print:max-w-none print:w-full print:block mx-auto box-border overflow-x-auto print:overflow-x-visible">
          
          <table className="w-full border-collapse">
            
            <thead className="table-header-group">
              <tr>
                <td className="pb-4" style={{ borderBottom: "2px solid #dc2626" }}>
                  {/* CABEÇALHO RESPONSIVO */}
                  <div className="flex flex-col sm:flex-row justify-between w-full items-center sm:items-end pt-2 gap-4 print:flex-row print:items-end">
                    <div className="flex justify-center sm:justify-start w-full sm:w-auto print:justify-start">
                      {brandLogo && <Image src={brandLogo} alt="Logo" width={400} height={150} quality={100} className="h-10 sm:h-12 print:h-12 w-auto object-contain" priority />}
                    </div>
                    <div className="text-center sm:text-right w-full sm:w-auto print:text-right">
                      <h1 className="text-xl sm:text-2xl print:text-xl font-bold uppercase tracking-tight" style={{ color: "#dc2626" }}>Orçamento</h1>
                      <div className="flex items-center justify-center sm:justify-end gap-2 mt-1 print:justify-end">
                        <p className="font-bold text-gray-800 text-sm sm:text-base print:text-[14px]">{budget.budgetNumber}</p>
                        <Badge className={`${statusColors[budget.status]} border-none px-2 py-0 h-5 text-[10px] sm:text-xs print:px-2 print:py-0 print:h-5`}>
                          {statusLabels[budget.status]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="py-4 sm:py-6 print:py-4">
                  
                  {/* DADOS RESPONSIVOS */}
                  {/* CORREÇÃO: gap-6 no mobile (menor que 8) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 w-full print:grid-cols-2">
                    <div className="w-full break-inside-avoid">
                      <h3 className="text-xs font-bold uppercase mb-1 pb-1" style={{ color: "#dc2626", borderBottom: "1px solid rgba(220, 38, 38, 0.2)" }}>Dados do Cliente</h3>
                      {/* CORREÇÃO: break-words para nomes longos não empurrarem a largura */}
                      <p className="font-bold text-sm text-gray-800 uppercase print:text-[13px] break-words">{budget.client.name}</p>
                      {budget.client.address && <p className="text-[11px] sm:text-xs text-gray-700 mt-1 print:text-[12px] break-words">{budget.client.address}</p>}
                      {budget.client.phone && <p className="text-[11px] sm:text-xs text-gray-700 mt-1 print:text-[12px]">{budget.client.phone}</p>}
                      {budget.client.email && <p className="text-[11px] sm:text-xs text-gray-700 mt-1 print:text-[12px] break-words">{budget.client.email}</p>}
                    </div>
                    <div className="w-full break-inside-avoid">
                      <h3 className="text-xs font-bold uppercase mb-1 pb-1" style={{ color: "#dc2626", borderBottom: "1px solid rgba(220, 38, 38, 0.2)" }}>Informações</h3>
                      <table className="w-full text-[11px] sm:text-xs print:text-[12px]">
                        <tbody>
                          <tr><td className="py-1 text-gray-700">Data Emissão:</td><td className="py-1 font-bold text-right">{new Date(budget.created_at).toLocaleDateString("pt-BR")}</td></tr>
                          {budget.validUntil && <tr><td className="py-1 text-gray-700">Válido até:</td><td className="py-1 font-bold text-right">{new Date(budget.validUntil).toLocaleDateString("pt-BR")}</td></tr>}
                          {budget.paymentMethod && <tr><td className="py-1 text-gray-700">Pagamento:</td><td className="py-1 font-bold text-right" style={{ color: "#dc2626" }}>{budget.paymentMethod}</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* TABELA DE PRODUTOS RESPONSIVA */}
                  <div className="mb-6 w-full">
                    <h3 className="text-xs font-bold uppercase mb-2" style={{ color: "#dc2626" }}>Produtos e Serviços</h3>
                    {/* Contêiner de rolagem - MANTIDO E REFORÇADO */}
                    <div className="overflow-x-auto print:overflow-visible w-full rounded box-border" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                      {/* CORREÇÃO: min-w-[550px] para garantir scroll horizontal saudável no mobile */}
                      <table className="w-full border-collapse min-w-[550px] print:min-w-0 print:w-full table-auto">
                        <thead className="text-[10px] sm:text-xs uppercase print:text-[12px]" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#dc2626" }}>
                          <tr>
                            <th className="p-2 text-left font-bold" style={{ borderBottom: "1px solid rgba(220, 38, 38, 0.2)" }}>Descrição</th>
                            <th className="p-2 text-center font-bold w-12 border-l" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>Qtd</th>
                            <th className="p-2 text-center font-bold w-12 border-l" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>Un</th>
                            <th className="p-2 text-right font-bold w-24 border-l" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>V. Unit.</th>
                            <th className="p-2 text-right font-bold w-24 border-l" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>Total</th>
                          </tr>
                        </thead>
                        <tbody className="text-[11px] sm:text-xs print:text-[12px]">
                          {budget.products.map((product, index) => (
                            <tr key={product.id} className="break-inside-avoid" style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "rgba(220, 38, 38, 0.05)" }}>
                              <td className="p-2 text-gray-800 border-t break-words" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>{product.description}</td>
                              <td className="p-2 text-center font-medium border-t border-l" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>{product.quantity}</td>
                              <td className="p-2 text-center border-t border-l" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>{product.unit}</td>
                              <td className="p-2 text-right border-t border-l whitespace-nowrap" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>R$ {product.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-right font-bold border-t border-l whitespace-nowrap" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}>
                          <tr className="break-inside-avoid">
                            {/* CORREÇÃO: whitespace-normal no total geral label */}
                            <td colSpan={4} className="p-2 text-right font-bold text-[10px] sm:text-xs print:text-[12px] border-t whitespace-normal" style={{ borderColor: "rgba(220, 38, 38, 0.2)", color: "#dc2626" }}>TOTAL GERAL:</td>
                            <td className="p-2 text-right font-bold text-xs sm:text-sm whitespace-nowrap border-t border-l print:text-[14px]" style={{ borderColor: "rgba(220, 38, 38, 0.2)", color: "#dc2626" }}>R$ {budget.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* OBSERVAÇÕES E ASSINATURAS RESPONSIVAS */}
                  <div className="print:break-inside-avoid w-full">
                    {budget.observations && (
                      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded">
                        <h3 className="text-xs font-bold uppercase mb-1" style={{ color: "#dc2626" }}>Observações</h3>
                        <p className="text-[11px] sm:text-xs text-gray-700 whitespace-pre-wrap print:text-[12px] break-words">{budget.observations}</p>
                      </div>
                    )}

                    <div className="p-3 rounded mb-6" style={{ backgroundColor: "rgba(220, 38, 38, 0.05)", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                      <p className="text-xs font-bold mb-1" style={{ color: "#dc2626" }}>IMPORTANTE:</p>
                      <p className="text-[10px] sm:text-[11px] print:text-[11px]" style={{ color: "#dc2626" }}>Este orçamento é válido somente mediante assinatura e carimbo oficial da {brandName}. Orçamentos não assinados não possuem validade comercial.</p>
                    </div>

                    {/* CORREÇÃO: gap-6 no mobile */}
                    <div className="grid grid-cols-2 gap-12 mt-10 mb-6">
                      <div className="text-center w-full">
                        <div className="h-10 border-b border-black/50 mb-2 w-full"></div>
                        <p className="text-xs font-bold text-gray-800 uppercase">{brandName}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Assinatura / Carimbo</p>
                      </div>
                      <div className="text-center w-full">
                        <div className="h-10 border-b border-black/50 mb-2 w-full"></div>
                        <p className="text-xs font-bold text-gray-800 uppercase">{budget.client.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Aceite do Cliente</p>
                      </div>
                    </div>

                    <div className="text-center w-full mt-4 break-inside-avoid">
                      <p className="text-[11px] sm:text-xs font-medium text-gray-800">DATA: ______ / ______ / ______</p>
                    </div>
                  </div>

                </td>
              </tr>
            </tbody>

            {/* TFOOT: Rodapé */}
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
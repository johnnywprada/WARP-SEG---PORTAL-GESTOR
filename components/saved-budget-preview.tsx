"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer, MessageCircle } from "lucide-react"
import Image from "next/image"
import { DocumentFooter } from "./DocumentFooter"

// --- Variáveis de Ambiente ---
const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";
const brandCnpj = process.env.NEXT_PUBLIC_BRAND_CNPJ || "CNPJ: 35.550.155/0001-86";
const brandAddress = process.env.NEXT_PUBLIC_BRAND_ADDRESS || "Rua barros cassal, 35";
const brandCity = process.env.NEXT_PUBLIC_BRAND_CITY || "Jardim Bom Clima - Guarulhos, SP - 07196-270";

interface Product { id: string; description: string; quantity: number; unit: string; unitPrice: number; total: number; }
interface ClientData { name: string; address: string; phone: string; email: string; }
interface SavedBudget {
  id: string; budgetNumber: string; client: ClientData; products: Product[]; paymentMethod: string;
  observations: string; validUntil: string; totalValue: number;
  status: "em-aberto" | "instalando" | "concluido" | "cancelado"; created_at: string;
}
interface SavedBudgetPreviewProps { budget: SavedBudget; onBack: () => void; onViewBudgetList: () => void; }

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
    // Monta a URL baseada no ambiente atual (localhost ou produção na Vercel)
    const publicUrl = `${window.location.origin}/view/${budget.id}`;
    
    // Formata o texto para o WhatsApp (codificado para URL)
    const text = `Olá ${budget.client.name}, tudo bem?\n\nAqui está o link seguro para visualização e download do seu orçamento da ${brandName}:\n\n${publicUrl}\n\nQualquer dúvida, estou à disposição.`;
    
    // Dispara a API nativa do WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }

  return (
    <div 
      className="min-h-screen bg-slate-100 flex flex-col print:bg-white print:block font-sans"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      
{/* BARRA DE CONTROLE */}
      <div className="sticky top-0 bg-white border-b shadow-sm z-50 p-4 flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onViewBudgetList} className="gap-2 !text-destructive !border-destructive/40 hover:bg-destructive/10">
          <ArrowLeft className="h-4 w-4" /> Voltar para a Lista
        </Button>
        
        <div className="flex items-center gap-3">
          {/* Botão de WhatsApp */}
          <Button onClick={handleWhatsAppShare} className="gap-2 bg-green-600 hover:bg-green-700 text-white border-none shadow-sm">
            <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
          </Button>

          <Button onClick={handlePrint} className="gap-2 bg-destructive hover:bg-destructive/90 text-white shadow-sm">
            <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      {/* ÁREA DE VISUALIZAÇÃO: Removidos tamanhos absolutos na impressão, usando 100% da área da folha */}
      <div className="flex-grow py-8 px-4 flex justify-center print:p-0 print:m-0 print:block w-full">
        
        <div className="bg-white shadow-xl w-full max-w-[210mm] p-8 md:p-12 print:p-0 print:shadow-none print:max-w-none print:w-full print:block mx-auto box-border">
          
          <table className="w-full border-collapse">
            
            {/* THEAD */}
            <thead className="table-header-group">
              <tr>
                <td className="pb-4" style={{ borderBottom: "2px solid #dc2626" }}>
                  {/* Grid de 2 colunas travado */}
                  <div className="grid grid-cols-2 w-full items-center pt-2">
                    <div className="flex justify-start">
                      {brandLogo && <Image src={brandLogo} alt="Logo" width={400} height={150} quality={100} className="h-12 print:h-12 w-auto object-contain" priority />}
                    </div>
                    <div className="text-right">
                      {/* Cor Hardcoded */}
                      <h1 className="text-2xl print:text-xl font-bold uppercase tracking-tight" style={{ color: "#dc2626" }}>
                        Orçamento
                      </h1>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <p className="font-bold text-gray-800 print:text-[14px]">{budget.budgetNumber}</p>
                        <Badge className={`${statusColors[budget.status]} border-none print:px-2 print:py-0 print:h-5`}>
                          {statusLabels[budget.status]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </thead>

            {/* TBODY */}
            <tbody>
              <tr>
                <td className="py-6 print:py-4">
                  
                  {/* Dados do Cliente e Orçamento */}
                  <div className="grid grid-cols-2 gap-8 mb-6 w-full">
                    <div className="w-full">
                      <h3 className="text-xs font-bold uppercase mb-1 pb-1" style={{ color: "#dc2626", borderBottom: "1px solid rgba(220, 38, 38, 0.2)" }}>
                        Dados do Cliente
                      </h3>
                      <p className="font-bold text-sm text-gray-800 uppercase print:text-[13px]">{budget.client.name}</p>
                      {budget.client.address && <p className="text-xs text-gray-700 mt-1 print:text-[12px]">{budget.client.address}</p>}
                      {budget.client.phone && <p className="text-xs text-gray-700 mt-1 print:text-[12px]">{budget.client.phone}</p>}
                      {budget.client.email && <p className="text-xs text-gray-700 mt-1 print:text-[12px]">{budget.client.email}</p>}
                    </div>
                    <div className="w-full">
                      <h3 className="text-xs font-bold uppercase mb-1 pb-1" style={{ color: "#dc2626", borderBottom: "1px solid rgba(220, 38, 38, 0.2)" }}>
                        Informações
                      </h3>
                      <table className="w-full text-xs print:text-[12px]">
                        <tbody>
                          <tr><td className="py-1 text-gray-700">Data Emissão:</td><td className="py-1 font-bold text-right">{new Date(budget.created_at).toLocaleDateString("pt-BR")}</td></tr>
                          {budget.validUntil && <tr><td className="py-1 text-gray-700">Válido até:</td><td className="py-1 font-bold text-right">{new Date(budget.validUntil).toLocaleDateString("pt-BR")}</td></tr>}
                          {budget.paymentMethod && <tr><td className="py-1 text-gray-700">Pagamento:</td><td className="py-1 font-bold text-right" style={{ color: "#dc2626" }}>{budget.paymentMethod}</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tabela de Produtos */}
                  <div className="mb-6 w-full">
                    <h3 className="text-xs font-bold uppercase mb-2" style={{ color: "#dc2626" }}>
                      Produtos e Serviços
                    </h3>
                    <table className="w-full border-collapse" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                      <thead className="text-xs uppercase print:text-[12px]" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#dc2626" }}>
                        <tr>
                          <th className="p-2 text-left font-bold" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>Descrição</th>
                          <th className="p-2 text-center font-bold w-12" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>Qtd</th>
                          <th className="p-2 text-center font-bold w-12" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>Un</th>
                          <th className="p-2 text-right font-bold w-24" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>V. Unit.</th>
                          <th className="p-2 text-right font-bold w-24" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs print:text-[12px]">
                        {budget.products.map((product, index) => (
                          <tr key={product.id} className="break-inside-avoid" style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "rgba(220, 38, 38, 0.05)" }}>
                            <td className="p-2 text-gray-800" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>{product.description}</td>
                            <td className="p-2 text-center font-medium" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>{product.quantity}</td>
                            <td className="p-2 text-center" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>{product.unit}</td>
                            <td className="p-2 text-right" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>R$ {product.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                            <td className="p-2 text-right font-bold" style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}>R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}>
                        <tr className="break-inside-avoid">
                          <td colSpan={4} className="p-2 text-right font-bold print:text-[12px]" style={{ border: "1px solid rgba(220, 38, 38, 0.2)", color: "#dc2626" }}>TOTAL GERAL:</td>
                          <td className="p-2 text-right font-bold text-sm whitespace-nowrap print:text-[14px]" style={{ border: "1px solid rgba(220, 38, 38, 0.2)", color: "#dc2626" }}>
                            R$ {budget.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Bloco de Observações e Assinaturas */}
                  <div className="print:break-inside-avoid w-full">
                    {budget.observations && (
                      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded">
                        <h3 className="text-xs font-bold uppercase mb-1" style={{ color: "#dc2626" }}>Observações</h3>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap print:text-[12px]">{budget.observations}</p>
                      </div>
                    )}

                    <div className="p-3 rounded mb-6" style={{ backgroundColor: "rgba(220, 38, 38, 0.05)", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                      <p className="text-xs font-bold mb-1" style={{ color: "#dc2626" }}>IMPORTANTE:</p>
                      <p className="text-[11px] print:text-[11px]" style={{ color: "#dc2626" }}>
                        Este orçamento é válido somente mediante assinatura e carimbo oficial da {brandName}. Orçamentos não assinados não possuem validade comercial.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 px-4 mb-6 mt-10 w-full">
                      <div className="text-center w-full">
                        <div className="h-10 border-b border-black/50 mb-2 w-full"></div>
                        <p className="text-xs font-bold text-gray-800">{brandName}</p>
                        <p className="text-[10px] text-gray-500">Assinatura e Carimbo</p>
                      </div>
                      <div className="text-center w-full">
                        <div className="h-10 border-b border-black/50 mb-2 w-full"></div>
                        <p className="text-xs font-bold text-gray-800 uppercase">{budget.client.name}</p>
                        <p className="text-[10px] text-gray-500">Aceite do Cliente</p>
                      </div>
                    </div>

                    <div className="text-center w-full">
                      <p className="text-xs font-medium text-gray-800">DATA: ______ / ______ / ______</p>
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
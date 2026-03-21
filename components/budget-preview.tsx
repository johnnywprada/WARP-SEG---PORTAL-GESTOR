"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Printer, Save, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { DocumentFooter } from "./DocumentFooter"

const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";
const brandIcon = process.env.NEXT_PUBLIC_BRAND_ICON || "/images/warpicon.png";

interface Product { id: string; description: string; quantity: number; unit: string; unitPrice: number; total: number; }
interface ClientData { name: string; address: string; phone: string; email: string; }
interface BudgetData { client: ClientData; products: Product[]; paymentMethod: string; observations: string; validUntil: string; budgetNumber: string; }

// Props com controle de salvamento
interface BudgetPreviewProps { budgetData: BudgetData; onBack: () => void; onSave?: () => void; isSaving?: boolean; }

// Cores e labels para o Badge
const statusLabels = { "em-aberto": "Em Aberto" };
const statusColors = { "em-aberto": "bg-yellow-100 text-yellow-800 border-yellow-200" };

export function BudgetPreview({ budgetData, onBack, onSave, isSaving }: BudgetPreviewProps) {
  const getTotalBudget = () => budgetData.products.reduce((sum, product) => sum + product.total, 0)
  const handlePrint = () => window.print()
  const currentDate = new Date().toLocaleDateString("pt-BR")

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans w-full overflow-x-hidden print:overflow-x-visible print:bg-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* FAIXA DE ALERTA DE RASCUNHO */}
      <div className="bg-amber-100 border-b border-amber-200 p-3 flex flex-col sm:flex-row items-center justify-center gap-2 print:hidden w-full z-50">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <span className="text-sm font-bold text-amber-800 uppercase text-center">Modo de Pré-visualização: Este orçamento ainda não foi salvo.</span>
      </div>

      {/* BARRA DE CONTROLE (EDITAR OU SALVAR) */}
      <div className="sticky top-0 bg-white border-b shadow-sm z-40 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <Button variant="outline" onClick={onBack} className="gap-2 w-full sm:w-auto text-slate-700 hover:bg-slate-100 border-slate-300">
          <ArrowLeft className="h-4 w-4" /> Voltar e Editar Dados
        </Button>
        
        {/* <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button onClick={handlePrint} variant="outline" className="gap-2 w-full sm:w-auto text-slate-700 hover:bg-slate-100 border-slate-300">
            <Printer className="h-4 w-4" /> Imprimir Rascunho
          </Button> */}
          
          {onSave && (
            <Button onClick={onSave} disabled={isSaving} className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto text-white shadow-sm">
              <Save className="h-4 w-4" /> 
              {isSaving ? "Salvando no Sistema..." : "Salvar Orçamento Definitivo"}
            </Button>
          )}
        {/* </div> */}
      </div>

      {/* VIEWPORT VIRTUAL CORRIGIDO (Scroll lateral liberado no mobile) */}
      <div className="flex-grow py-4 sm:py-8 w-full overflow-x-auto print:overflow-x-visible px-2 sm:px-0 pb-8">
        
        <div className="w-full min-w-[650px] max-w-[210mm] mx-auto bg-white shadow-xl p-6 sm:p-12 print:p-0 print:shadow-none print:max-w-none print:w-full print:block box-border">
          <table className="w-full border-collapse">
            <thead className="table-header-group">
              <tr>
                <td className="pb-4" style={{ borderBottom: "2px solid #dc2626" }}>
                  <div className="flex justify-between items-end pt-2 gap-4">
                    <div className="flex justify-start">
                      {brandLogo && <Image src={brandLogo} alt="Logo" width={400} height={150} quality={100} className="h-12 w-auto object-contain print:h-10" priority />}
                    </div>
                    <div className="text-right">
                      <h1 className="text-2xl font-bold uppercase tracking-tight" style={{ color: "#dc2626" }}>Orçamento</h1>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <p className="font-bold text-gray-800 text-base">{budgetData.budgetNumber}</p>
                        <Badge className={`${statusColors["em-aberto"]} border-none px-2 py-0 h-5 text-xs`}>
                          {statusLabels["em-aberto"]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="py-6 print:py-4">
                  
                  <div className="grid grid-cols-2 gap-8 mb-6 border-b border-gray-100 pb-4 break-inside-avoid">
                    <div>
                      <h3 className="text-sm font-bold uppercase mb-1" style={{ color: "#dc2626" }}>Dados do Cliente</h3>
                      <p className="font-bold text-sm text-gray-800 uppercase">{budgetData.client.name}</p>
                      {budgetData.client.address && <p className="text-xs text-gray-700 mt-1">{budgetData.client.address}</p>}
                      {budgetData.client.phone && <p className="text-xs text-gray-700 mt-1">{budgetData.client.phone}</p>}
                      {budgetData.client.email && <p className="text-xs text-gray-700 mt-1">{budgetData.client.email}</p>}
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-bold uppercase mb-1" style={{ color: "#dc2626" }}>Informações</h3>
                      <div className="space-y-1 text-xs text-gray-800">
                        <p><span className="text-gray-600">Data Emissão:</span> <span className="font-bold">{currentDate}</span></p>
                        {budgetData.validUntil && <p><span className="text-gray-600">Válido até:</span> <span className="font-bold">{new Date(budgetData.validUntil).toLocaleDateString("pt-BR")}</span></p>}
                        {budgetData.paymentMethod && <p><span className="text-gray-600">Pagamento:</span> <span className="font-bold" style={{ color: "#dc2626" }}>{budgetData.paymentMethod}</span></p>}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 w-full break-inside-avoid">
                    <h3 className="text-sm font-bold uppercase mb-2" style={{ color: "#dc2626" }}>Produtos e Serviços</h3>
                    <div className="rounded border overflow-hidden" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>
                      <table className="w-full border-collapse">
                        <thead className="text-xs uppercase" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#dc2626" }}>
                          <tr>
                            <th className="p-2 text-left font-bold border-b border-red-200">Descrição</th>
                            <th className="p-2 text-center font-bold border-b border-l border-red-200 w-16">Qtd</th>
                            <th className="p-2 text-center font-bold border-b border-l border-red-200 w-16">Un</th>
                            <th className="p-2 text-right font-bold border-b border-l border-red-200 w-28">V. Unit.</th>
                            <th className="p-2 text-right font-bold border-b border-l border-red-200 w-28">Total</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs">
                          {budgetData.products.map((product, index) => (
                            <tr key={product.id} className="break-inside-avoid" style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "rgba(220, 38, 38, 0.05)" }}>
                              <td className="p-2 text-gray-800 border-b border-red-50">{product.description}</td>
                              <td className="p-2 text-center font-medium border-b border-l border-red-50">{product.quantity}</td>
                              <td className="p-2 text-center border-b border-l border-red-50">{product.unit}</td>
                              <td className="p-2 text-right border-b border-l border-red-50 whitespace-nowrap">R$ {product.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                              <td className="p-2 text-right font-bold border-b border-l border-red-50 whitespace-nowrap">R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}>
                          <tr className="break-inside-avoid">
                            <td colSpan={4} className="p-2 text-right font-bold text-xs" style={{ color: "#dc2626" }}>TOTAL GERAL:</td>
                            <td className="p-2 text-right font-bold text-sm whitespace-nowrap" style={{ color: "#dc2626" }}>R$ {getTotalBudget().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  <div className="print:break-inside-avoid w-full">
                    {budgetData.observations && (
                      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded">
                        <h3 className="text-sm font-bold uppercase mb-1" style={{ color: "#dc2626" }}>Observações</h3>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{budgetData.observations}</p>
                      </div>
                    )}

                    <div className="p-3 rounded mb-6" style={{ backgroundColor: "rgba(220, 38, 38, 0.05)", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                      <p className="text-xs font-bold mb-1" style={{ color: "#dc2626" }}>IMPORTANTE:</p>
                      <p className="text-xs" style={{ color: "#dc2626" }}>Este orçamento é válido somente mediante assinatura e carimbo oficial da {brandName}. Orçamentos não assinados não possuem validade comercial.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mt-10 mb-6">
                      <div className="text-center w-full">
                        <div className="h-10 border-b border-black/50 mb-2 w-full"></div>
                        <p className="text-xs font-bold text-gray-800 uppercase">{brandName}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Assinatura e Carimbo</p>
                      </div>
                      <div className="text-center w-full">
                        <div className="h-10 border-b border-black/50 mb-2 w-full"></div>
                        <p className="text-xs font-bold text-gray-800 uppercase">{budgetData.client.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Aceite do Cliente</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end px-4">
                      <div className="w-1/3"></div>
                      <div className="w-1/3 flex justify-center">
                        {brandIcon && <Image alt="Icon" width={40} height={40} quality={100} className="w-auto h-10 opacity-60 print:h-8 object-contain" src={brandIcon} />}
                      </div>
                      <div className="w-1/3 text-right">
                        <p className="text-xs font-bold text-gray-500">DATA: ______ / ______ / ______</p>
                      </div>
                    </div>
                  </div>

                </td>
              </tr>
            </tbody>

            <tfoot className="table-header-group">
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
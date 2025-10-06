"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Image from "next/image"

// ... (todas as suas interfaces continuam aqui, sem alterações)
interface Product { id: string; description: string; quantity: number; unit: string; unitPrice: number; total: number; }
interface ClientData { name: string; address: string; phone: string; email: string; }
interface BudgetData { client: ClientData; products: Product[]; paymentMethod: string; observations: string; validUntil: string; }
interface BudgetPreviewProps { budgetData: BudgetData; onBack: () => void; }


export function BudgetPreview({ budgetData, onBack }: BudgetPreviewProps) {
  const getTotalBudget = () => {
    return budgetData.products.reduce((sum, product) => sum + product.total, 0)
  }

  const handlePrint = () => {
    window.print()
  }

  const budgetNumber = `ORÇ-${Date.now().toString().slice(-6)}`
  const currentDate = new Date().toLocaleDateString("pt-BR")

  return (
    <div className="min-h-screen bg-background">
      {/* Botões de ação */}
      <div className="no-print sticky top-0 bg-background border-b p-4 flex justify-between items-center print:hidden">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 bg-transparent border-red-200 text-red-600 hover:bg-red-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Formulário
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2 bg-transparent border-red-200 text-red-600 hover:bg-red-50"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={handlePrint} className="gap-2 bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4" />
            Salvar PDF
          </Button>
        </div>
      </div>

      {/* Conteúdo do orçamento */}
      <div className="container mx-auto p-2 max-w-4xl print:p-0 print:max-w-none">
        <Card className="print-page border-red-100 print:border-0 print:shadow-none">
          <CardContent className="p-3 print:p-4">
            {/* ... (Todo o JSX do seu orçamento continua aqui, sem alterações) ... */}
            <div className="print-header mb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2"><Image src="/images/warp-logo.png" alt="WARP" width={140} height={42} className="h-8 w-auto print:h-10" /></div>
                <div className="text-right"><div className="text-xl font-bold text-red-600 mb-1 print:text-2xl">ORÇAMENTO</div><div className="text-xs space-y-0"><p><strong>Nº:</strong> {budgetNumber}</p><p><strong>Data:</strong> {currentDate}</p>{budgetData.validUntil && (<p><strong>Válido até:</strong> {new Date(budgetData.validUntil).toLocaleDateString("pt-BR")}</p>)}</div></div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-1.5 mb-2"><div className="text-xs text-gray-700 flex flex-wrap gap-x-3 gap-y-0"><span><strong>CNPJ:</strong> 35.550.155/0001-86</span><span><strong>End.:</strong> Rua Barros Cassal, 35 - Jardim Bom Clima</span><span><strong>Cidade:</strong> Guarulhos, SP - CEP: 07196-270</span></div></div>
            </div>
            <div className="mb-3"><h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">DADOS DO CLIENTE</h2><div className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs space-y-0.5"><p><strong>Nome/Razão Social:</strong> {budgetData.client.name}</p>{budgetData.client.address && (<p><strong>Endereço:</strong> {budgetData.client.address}</p>)}<div className="flex gap-4">{budgetData.client.phone && (<span><strong>Tel:</strong> {budgetData.client.phone}</span>)}{budgetData.client.email && (<span><strong>E-mail:</strong> {budgetData.client.email}</span>)}</div></div></div>
            <div className="mb-3"><h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">PRODUTOS/SERVIÇOS</h2><div className="border border-red-200 rounded overflow-hidden"><table className="w-full text-xs"><thead className="bg-red-600 text-white"><tr><th className="text-left p-1.5 font-semibold">Item</th><th className="text-left p-1.5 font-semibold">Descrição</th><th className="text-center p-1.5 font-semibold">Qtd</th><th className="text-center p-1.5 font-semibold">Un.</th><th className="text-right p-1.5 font-semibold">Valor Unit.</th><th className="text-right p-1.5 font-semibold">Total</th></tr></thead><tbody>{budgetData.products.map((product, index) => (<tr key={product.id} className="border-b border-red-100"><td className="p-1.5 font-medium">{index + 1}</td><td className="p-1.5">{product.description}</td><td className="p-1.5 text-center">{product.quantity}</td><td className="p-1.5 text-center">{product.unit}</td><td className="p-1.5 text-right">R$ {product.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td><td className="p-1.5 text-right font-semibold">R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>))}</tbody><tfoot className="bg-red-100"><tr><td colSpan={5} className="p-1.5 text-right font-bold">TOTAL GERAL:</td><td className="p-1.5 text-right font-bold text-base text-red-600">R$ {getTotalBudget().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr></tfoot></table></div></div>
            <div className="mb-3"><h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">CONDIÇÕES COMERCIAIS</h2><div className="space-y-1 text-xs">{budgetData.paymentMethod && (<p><strong>Forma de Pagamento:</strong> {budgetData.paymentMethod}</p>)}{budgetData.observations && (<div><p><strong>Observações:</strong></p><p className="mt-0.5 text-xs leading-tight bg-gray-50 p-1.5 rounded border">{budgetData.observations}</p></div>)}</div></div>
            <div className="space-y-3 print:space-y-2">
                <div className="bg-red-50 border border-red-200 p-3 rounded print:p-2">
                    <p className="text-xs font-semibold text-red-700 mb-1">IMPORTANTE:</p>
                    <p className="text-xs text-red-600">Este orçamento é válido somente mediante assinatura e carimbo oficial da WARP SEGURANÇA ELETRÔNICA. Orçamentos não assinados não possuem validade comercial.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                    <div className="border border-gray-300 p-3 rounded print:p-2">
                        <p className="text-xs font-medium mb-2">ASSINATURA E CARIMBO:</p>
                        <div className="h-12 print:h-8"></div>
                        <div className="border-t border-gray-300 pt-1">
                            <p className="text-xs text-center">WARP SEGURANÇA ELETRÔNICA</p>
                        </div>
                    </div>
                    
                    <div className="border border-gray-300 p-3 rounded print:p-2">
                        <p className="text-xs font-medium mb-2">ACEITE DO CLIENTE:</p>
                        <div className="h-12 print:h-8"></div>
                        <div className="border-t border-gray-300 pt-1">
                            <p className="text-xs text-center">CLIENTE</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 items-center mt-8 print:mt-4">
                <div></div>

                <div className="flex justify-center">
                    <Image
                        alt="Mascote WARP"
                        width={60}
                        height={60}
                        className="h-12 w-auto opacity-50 print:h-8"
                        src="/images/warp-mascot.png" 
                    />
                </div>

                <div className="flex justify-end">
                    <p className="text-sm font-medium text-gray-600 print:text-black">
                        DATA: ______ / ______ / ______
                    </p>
                </div>
            </div>

            {/* ====================================================================== */}
            {/* FIM DO NOVO BLOCO DE ASSINATURA                                        */}
            {/* ====================================================================== */}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
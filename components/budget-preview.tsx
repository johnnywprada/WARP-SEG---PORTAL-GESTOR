"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Image from "next/image"

// Interfaces adaptadas para os dados do formulário
interface Product { id: string; description: string; quantity: number; unit: string; unitPrice: number; total: number; }
interface ClientData { name: string; address: string; phone: string; email: string; }
interface BudgetData { client: ClientData; products: Product[]; paymentMethod: string; observations: string; validUntil: string; budgetNumber: string; }
interface BudgetPreviewProps { budgetData: BudgetData; onBack: () => void; }

export function BudgetPreview({ budgetData, onBack }: BudgetPreviewProps) {
  const getTotalBudget = () => {
    return budgetData.products.reduce((sum, product) => sum + product.total, 0)
  }

  const handlePrint = () => {
    window.print()
  }
  
  const currentDate = new Date().toLocaleDateString("pt-BR")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden bg-white border-b p-4">
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
          <Button variant="outline" onClick={onBack} className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Formulário
          </Button>
          <Button onClick={handlePrint} className="gap-2 bg-red-600 hover:bg-red-700">
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-4 print:p-0">
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-4 print:p-6">
            <div className="flex items-center justify-between mb-4 print:mb-3">
              <Image src="/images/warp-logo.png" alt="WARP Segurança Eletrônica" width={200} height={60} className="h-12 w-auto print:h-10" />
              <div className="text-right">
                <h1 className="text-xl font-bold text-red-600 print:text-lg">ORÇAMENTO</h1>
                <p className="text-sm font-semibold">{budgetData.budgetNumber}</p>
              </div>
            </div>

            <Separator className="mb-4 print:mb-3" />

            <div className="bg-red-50 p-3 rounded-lg mb-4 print:mb-3 print:p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs print:text-xs">
                <div><p className="font-semibold text-red-700">WARP SEGURANÇA ELETRÔNICA</p><p>CNPJ: 35.550.155/0001-86</p></div>
                <div><p>Rua barros cassal, 35</p><p>Jardim Bom Clima - Guarulhos, SP - 07196-270</p></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 print:mb-3">
              <div>
                <h3 className="font-semibold text-red-600 mb-2 print:text-sm">DADOS DO CLIENTE</h3>
                <div className="space-y-1 text-sm print:text-xs">
                  <p><span className="font-medium">Nome:</span> {budgetData.client.name}</p>
                  {budgetData.client.phone && (<p><span className="font-medium">Telefone:</span> {budgetData.client.phone}</p>)}
                  {budgetData.client.email && (<p><span className="font-medium">E-mail:</span> {budgetData.client.email}</p>)}
                  {budgetData.client.address && (<p><span className="font-medium">Endereço:</span> {budgetData.client.address}</p>)}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-red-600 mb-2 print:text-sm">INFORMAÇÕES DO ORÇAMENTO</h3>
                <div className="space-y-1 text-sm print:text-xs">
                  <p><span className="font-medium">Data:</span> {currentDate}</p>
                  {budgetData.validUntil && (<p><span className="font-medium">Válido até:</span> {new Date(budgetData.validUntil).toLocaleDateString("pt-BR")}</p>)}
                  {budgetData.paymentMethod && (<p><span className="font-medium">Pagamento:</span> {budgetData.paymentMethod}</p>)}
                </div>
              </div>
            </div>

            <Separator className="mb-4 print:mb-3" />

            <div className="mb-4 print:mb-3">
              <h3 className="font-semibold text-red-600 mb-2 print:text-sm">PRODUTOS/SERVIÇOS</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-red-200 text-sm print:text-xs products-table">
                  <thead><tr className="bg-red-200 text-black font-bold"><th className="border border-red-200 p-2 text-left print:p-1">Descrição</th><th className="border border-red-200 p-2 text-center print:p-1">Qtd</th><th className="border border-red-200 p-2 text-center print:p-1">Un.</th><th className="border border-red-200 p-2 text-right print:p-1">Valor Unit.</th><th className="border border-red-200 p-2 text-right print:p-1">Total</th></tr></thead>
                  <tbody>
  {budgetData.products.map((product, index) => (
    <tr key={product.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
      
      {/* Coluna 1: Descrição */}
      <td className="border border-red-200 p-2 print:p-1">{product.description}</td>
      
      {/* Coluna 2: Quantidade */}
      <td className="border border-red-200 p-2 text-center print:p-1">{product.quantity}</td>
      
      {/* Coluna 3: Unidade */}
      <td className="border border-red-200 p-2 text-center print:p-1">{product.unit}</td>
      
      {/* Coluna 4: Valor Unitário */}
      <td className="border border-red-200 p-2 text-right print:p-1">
        R$ {product.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </td>
      
      {/* Coluna 5: Total */}
      <td className="border border-red-200 p-2 text-right print:p-1">
        R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </td>

    </tr>
  ))}
</tbody>
                  <tfoot><tr className="bg-red-200 text-black font-bold"><td colSpan={4} className="border border-red-200 p-2 text-right print:p-1">TOTAL GERAL:</td><td className="border border-red-200 p-2 text-right print:p-1">R$ {getTotalBudget().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr></tfoot>
                </table>
              </div>
            </div>

            {budgetData.observations && (
              <div className="mb-4 print:mb-3">
                <h3 className="font-semibold text-red-600 mb-2 print:text-sm">OBSERVAÇÕES</h3>
                <p className="text-sm bg-gray-50 p-2 rounded print:text-xs print:p-1">{budgetData.observations}</p>
              </div>
            )}

            <div className="space-y-3 print:space-y-2">
              <div className="bg-red-50 border border-red-200 p-3 rounded print:p-2">
                <p className="text-xs font-semibold text-red-700 mb-1">IMPORTANTE:</p>
                <p className="text-xs text-red-600">Este orçamento é válido somente mediante assinatura e carimbo oficial da WARP SEGURANÇA ELETRÔNICA. Orçamentos não assinados não possuem validade comercial.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                <div className="border border-gray-300 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ASSINATURA E CARIMBO:</p><div className="h-12 print:h-8"></div><div className="border-t border-gray-300 pt-1"><p className="text-xs text-center">WARP SEGURANÇA ELETRÔNICA</p></div></div>
                <div className="border border-gray-300 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ACEITE DO CLIENTE:</p><div className="h-12 print:h-8"></div><div className="border-t border-gray-300 pt-1"><p className="text-xs text-center">CLIENTE</p></div></div>
              </div>
            </div>

            <div className="grid grid-cols-3 items-center mt-8 print:mt-4">
              <div></div>
              <div className="flex justify-center">
                <Image alt="Mascote WARP" width={60} height={60} className="h-12 w-auto opacity-85 print:h-8" src="/images/warp-mascot.png" />
              </div>
              <div className="flex justify-end">
                {/* CORREÇÃO DA COR APLICADA */}
                <p className="text-xs font-medium.mb-2">DATA: ______ / ______ / ______</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
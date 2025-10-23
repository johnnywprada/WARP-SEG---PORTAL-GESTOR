"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer } from "lucide-react"
import Image from "next/image"
import { DocumentFooter } from "./DocumentFooter"

// --- CORREÇÃO 1: Definimos a "forma" de um Produto para sermos específicos ---
interface Product {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

interface SavedBudget {
  id: string
  budgetNumber: string
  client: {
    name: string
    address: string
    phone: string
    email: string
  }
  // Agora usamos a interface Product em vez de 'Array<any>'
  products: Product[]
  paymentMethod: string
  observations: string
  validUntil: string
  totalValue: number
  status: "em-aberto" | "instalando" | "concluido" | "cancelado"
  created_at: string
}

interface SavedBudgetPreviewProps {
  budget: SavedBudget
  onBack: () => void
}

const statusLabels = { "em-aberto": "Em Aberto", instalando: "Instalando", concluido: "Concluído", cancelado: "Cancelado" };
const statusColors = { "em-aberto": "bg-yellow-100 text-yellow-800 border-yellow-200", instalando: "bg-blue-100 text-blue-800 border-blue-200", concluido: "bg-green-100 text-green-800 border-green-200", cancelado: "bg-red-100 text-red-800 border-red-200" };

export function SavedBudgetPreview({ budget, onBack }: SavedBudgetPreviewProps) {
  const handlePrint = () => {
    // Salva o título original da página
    const originalTitle = document.title;
    // Define o novo título para o arquivo
    document.title = `ORÇAMENTO ${budget.budgetNumber}`;
    // Chama a impressão
    window.print();
    // Restaura o título original depois que a janela de impressão é fechada
    setTimeout(() => {
        document.title = originalTitle;
    }, 500);
}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden bg-white border-b p-4">
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
           {/* BOTÃO DE VOLTAR NA ESQUERDA */}
          <Button variant="outline" onClick={onBack} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
            <ArrowLeft className="h-4 w-4" /> Voltar à Lista
          </Button>

          {/* BOTÃO ÚNICO NA DIREITA */}
          <Button onClick={handlePrint} className="gap-2 bg-red-600 hover:bg-red-700">
            <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
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
                <p className="text-sm font-semibold">{budget.budgetNumber}</p>
                <Badge className={`${statusColors[budget.status]} print:text-xs`}>{statusLabels[budget.status]}</Badge>
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
                  <p><span className="font-medium">Nome:</span> {budget.client.name}</p>
                  {budget.client.phone && (<p><span className="font-medium">Telefone:</span> {budget.client.phone}</p>)}
                  {budget.client.email && (<p><span className="font-medium">E-mail:</span> {budget.client.email}</p>)}
                  {budget.client.address && (<p><span className="font-medium">Endereço:</span> {budget.client.address}</p>)}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-red-600 mb-2 print:text-sm">INFORMAÇÕES DO ORÇAMENTO</h3>
                <div className="space-y-1 text-sm print:text-xs">
                  <p><span className="font-medium">Data:</span> {new Date(budget.created_at).toLocaleDateString("pt-BR")}</p>
                  {budget.validUntil && (<p><span className="font-medium">Válido até:</span> {new Date(budget.validUntil).toLocaleDateString("pt-BR")}</p>)}
                  {budget.paymentMethod && (<p><span className="font-medium">Pagamento:</span> {budget.paymentMethod}</p>)}
                </div>
              </div>
            </div>
            <Separator className="mb-4 print:mb-3" />
            <div className="mb-4 print:mb-3">
              <h3 className="font-semibold text-red-600 mb-2 print:text-sm">PRODUTOS/SERVIÇOS</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-red-200 text-sm print:text-xs products-table">
                  <thead className="bg-red-100 text-black font-bold table-print-header"><tr><th className="border border-red-200 p-2 text-left print:p-1">Descrição</th><th className="border border-red-200 p-2 text-center print:p-1">Qtd</th><th className="border border-red-200 p-2 text-center print:p-1">Un.</th><th className="border border-red-200 p-2 text-right print:p-1">Valor Unit.</th><th className="border border-red-200 p-2 text-right print:p-1">Total</th></tr></thead>
                  <tbody>
                    {/* --- CORREÇÃO 2: Usamos 'budget.products' em vez de 'budgetData.products' --- */}
                    {budget.products.map((product, index) => (
                      <tr key={product.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="border border-red-200 p-2 print:p-1">{product.description}</td>
                        <td className="border border-red-200 p-2 text-center print:p-1">{product.quantity}</td>
                        <td className="border border-red-200 p-2 text-center print:p-1">{product.unit}</td>
                        <td className="border border-red-200 p-2 text-right print:p-1">R$ {product.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="border border-red-200 p-2 text-right print:p-1">R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-red-100 text-black font-bold table-print-footer"><tr><td colSpan={4} className="border border-red-200 p-2 text-right print:p-1">TOTAL GERAL:</td><td className="border border-red-200 p-2 text-right print:p-1">R$ {budget.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr></tfoot>
                </table>
              </div>
            </div>
            {budget.observations && (
              <div className="mb-4 print:mb-3">
                <h3 className="font-semibold text-red-600 mb-2 print:text-sm">OBSERVAÇÕES</h3>
                <p className="text-sm bg-gray-50 p-2 rounded print:text-xs print:p-1">{budget.observations}</p>
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
                <Image alt="warpicon" width={60} height={60} className="h-12 w-auto opacity-85 print:h-8" src="/images/warpicon.png" />
              </div>
              <div className="flex justify-end">
                <p className="text-sm font-medium print:text-black">DATA: ______ / ______ / ______</p>
              </div>
            </div>
          </CardContent>
          <DocumentFooter />
        </Card>
      </div>
    </div>
  )
}
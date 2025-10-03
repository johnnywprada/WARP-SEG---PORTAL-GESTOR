"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

interface ClientData {
  name: string
  address: string
  phone: string
  email: string
}

interface BudgetData {
  client: ClientData
  products: Product[]
  paymentMethod: string
  observations: string
  validUntil: string
}

interface BudgetPreviewProps {
  budgetData: BudgetData
  onBack: () => void
}

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
      {/* Botões de ação - não aparecem na impressão */}
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
            <div className="print-header mb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/warp-logo.png"
                    alt="WARP Segurança Eletrônica"
                    width={140}
                    height={42}
                    className="h-8 w-auto print:h-10"
                  />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-600 mb-1 print:text-2xl">ORÇAMENTO</div>
                  <div className="text-xs space-y-0">
                    <p>
                      <strong>Nº:</strong> {budgetNumber}
                    </p>
                    <p>
                      <strong>Data:</strong> {currentDate}
                    </p>
                    {budgetData.validUntil && (
                      <p>
                        <strong>Válido até:</strong> {new Date(budgetData.validUntil).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded p-1.5 mb-2">
                <div className="text-xs text-gray-700 flex flex-wrap gap-x-3 gap-y-0">
                  <span>
                    <strong>CNPJ:</strong> 35.550.155/0001-86
                  </span>
                  <span>
                    <strong>End.:</strong> Rua Pedro Fernandes Biscaino, 226 - Jardim Diogo
                  </span>
                  <span>
                    <strong>Cidade:</strong> Guarulhos, SP - CEP: 01735-030
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">
                DADOS DO CLIENTE
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs space-y-0.5">
                <p>
                  <strong>Nome/Razão Social:</strong> {budgetData.client.name}
                </p>
                {budgetData.client.address && (
                  <p>
                    <strong>Endereço:</strong> {budgetData.client.address}
                  </p>
                )}
                <div className="flex gap-4">
                  {budgetData.client.phone && (
                    <span>
                      <strong>Tel:</strong> {budgetData.client.phone}
                    </span>
                  )}
                  {budgetData.client.email && (
                    <span>
                      <strong>E-mail:</strong> {budgetData.client.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">
                PRODUTOS/SERVIÇOS
              </h2>
              <div className="border border-red-200 rounded overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-red-600 text-white">
                    <tr>
                      <th className="text-left p-1.5 font-semibold">Item</th>
                      <th className="text-left p-1.5 font-semibold">Descrição</th>
                      <th className="text-center p-1.5 font-semibold">Qtd</th>
                      <th className="text-center p-1.5 font-semibold">Un.</th>
                      <th className="text-right p-1.5 font-semibold">Valor Unit.</th>
                      <th className="text-right p-1.5 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetData.products.map((product, index) => (
                      <tr key={product.id} className="border-b border-red-100">
                        <td className="p-1.5 font-medium">{index + 1}</td>
                        <td className="p-1.5">{product.description}</td>
                        <td className="p-1.5 text-center">{product.quantity}</td>
                        <td className="p-1.5 text-center">{product.unit}</td>
                        <td className="p-1.5 text-right">
                          R$ {product.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 text-right font-semibold">
                          R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-red-100">
                    <tr>
                      <td colSpan={5} className="p-1.5 text-right font-bold">
                        TOTAL GERAL:
                      </td>
                      <td className="p-1.5 text-right font-bold text-base text-red-600">
                        R$ {getTotalBudget().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mb-3">
              <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">
                CONDIÇÕES COMERCIAIS
              </h2>
              <div className="space-y-1 text-xs">
                {budgetData.paymentMethod && (
                  <p>
                    <strong>Forma de Pagamento:</strong> {budgetData.paymentMethod}
                  </p>
                )}
                {budgetData.observations && (
                  <div>
                    <p>
                      <strong>Observações:</strong>
                    </p>
                    <p className="mt-0.5 text-xs leading-tight bg-gray-50 p-1.5 rounded border">
                      {budgetData.observations}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-2 bg-red-50 border-2 border-red-300 rounded p-2">
              <div className="flex items-start gap-2">
                <div className="bg-red-600 text-white rounded-full p-0.5 mt-0.5">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-xs">
                  <p className="font-bold text-red-800 mb-0.5">IMPORTANTE - VALIDADE DO ORÇAMENTO:</p>
                  <p className="text-red-700 leading-tight">
                    <strong>
                      Este orçamento somente será válido mediante assinatura e carimbo oficial da WARP SEGURANÇA
                      ELETRÔNICA.
                    </strong>
                    Orçamentos não assinados ou emitidos por terceiros não autorizados não possuem validade comercial.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-red-200 pt-2">
              <div className="flex items-end justify-between">
                <div className="text-xs text-gray-600 flex-1">
                  <p className="mb-1 font-semibold">Validade: 30 dias a partir da data de emissão.</p>
                  <div className="flex justify-between items-end mt-4">
                    <div className="text-center">
                      <div className="w-48 h-8 border-b border-gray-400 mb-1"></div>
                      <div className="w-48 border-b border-gray-400 mb-1"></div>
                      <p className="text-xs text-gray-500">Assinatura e Carimbo WARP SEG</p>
                    </div>
                    <div className="text-center">
                      <div className="w-24 border-b border-gray-400 mb-1 mt-8"></div>
                      <p className="text-xs text-gray-500">Data: ___/___/___</p>
                    </div>
                  </div>
                </div>
                <Image
                  src="/images/warp-mascot.png"
                  alt="Mascote WARP"
                  width={32}
                  height={32}
                  className="h-6 w-auto opacity-80 ml-3"
                />
              </div>
              <div className="text-center text-red-600 font-semibold text-xs mt-1">
                WARP SEGURANÇA ELETRÔNICA - Protegendo o que é importante para você
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          /* Removendo todos os elementos desnecessários da impressão */
          .no-print, 
          .print\\:hidden,
          nav,
          header,
          footer,
          .sticky,
          button,
          .cursor-pointer {
            display: none !important;
          }
          
          /* Resetando completamente o layout para impressão limpa */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            font-size: 12px !important;
            line-height: 1.3 !important;
            background: white !important;
            color: black !important;
          }
          
          /* Garantindo que apenas o conteúdo do documento apareça */
          .print-page {
            page-break-inside: avoid;
            margin: 0 !important;
            padding: 8mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            width: 100% !important;
            max-width: none !important;
          }
          
          @page {
            margin: 8mm !important;
            size: A4 !important;
          }
          
          /* Otimizando tabelas para impressão */
          table {
            page-break-inside: auto !important;
            width: 100% !important;
          }
          
          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          
          /* Removendo qualquer container ou wrapper desnecessário */
          .container {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          
          .min-h-screen {
            min-height: auto !important;
            height: auto !important;
          }
          
          /* Garantindo que cores e bordas apareçam na impressão */
          .bg-red-600,
          .text-red-600,
          .border-red-200,
          .border-red-100 {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}

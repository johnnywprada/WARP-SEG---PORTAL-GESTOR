"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer } from "lucide-react" // Importei ArrowLeft
import Image from "next/image"
import { PageHeader } from "./PageHeader"
import { type Quotation } from "@/lib/types" // Importa o tipo central
import { DocumentFooter } from "./DocumentFooter"

interface QuotationDetailProps {
  quotation: Quotation;
  onBack: () => void;
  onLogout: () => void;
}

const statusColors: { [key: string]: string } = {
  "Em cotação": "bg-blue-100 text-blue-800",
  "Aprovado": "bg-green-100 text-green-800",
  "Cancelado": "bg-red-100 text-red-800",
};

export function QuotationDetail({ quotation, onBack, onLogout }: QuotationDetailProps) {
  
  // --- FUNÇÕES DE CÁLCULO (Replicadas para exibição) ---
  const { itens_cotados = [], porcentagem_lucro = 0 } = quotation;
  const custoTotal = itens_cotados.reduce((sum, item) => sum + (item.custo_unitario * item.quantidade), 0);
  const precoFinalVenda = custoTotal * (1 + porcentagem_lucro / 100);
  const valorLucro = precoFinalVenda - custoTotal;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `COTAÇÃO - ${quotation.nome_cotacao}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      {/* Container do papel timbrado para impressão */}
      <div className="print-only print-background-container"></div>

      {/* Cabeçalho da página (só aparece na tela) */}
      <div className="no-print sticky top-0 bg-background border-b p-4 flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
          <ArrowLeft className="h-4 w-4" /> Voltar para a Lista
        </Button>
        <Button onClick={handlePrint} className="gap-2 bg-red-600 hover:bg-red-700">
          <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
        </Button>
      </div>
      
      {/* Container do Conteúdo */}
      <div className="container mx-auto p-2 max-w-4xl print:p-0 print:max-w-none">
        <Card className="print-page border-red-100 print:border-0 print:shadow-none">
          <CardContent className="p-3 print:p-4">
            
            {/* 1. Cabeçalho do Documento */}
            <div className="print-header mb-3">
              <div className="flex justify-between items-start mb-2">
                <Image src="/images/warp-logo.png" alt="WARP" width={140} height={42} className="h-8 w-auto print:h-10" />
                <div className="text-right">
                  <div className="text-xl font-bold text-red-600 mb-1 print:text-2xl">COTAÇÃO INTERNA</div>
                  <Badge className={statusColors[quotation.status] || 'bg-gray-100'}>{quotation.status}</Badge>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-1.5 mb-2">
                <div className="text-xs text-gray-700 flex flex-wrap gap-x-3 gap-y-0">
                  <span><strong>CNPJ:</strong> 35.550.155/0001-86</span>
                  <span><strong>End.:</strong> Rua Barros Cassal, 35 - Jardim Bom Clima</span>
                  <span><strong>Cidade:</strong> Guarulhos, SP - CEP: 07196-270</span>
                </div>
              </div>
            </div>

            {/* 2. Informações Gerais da Cotação */}
            <div className="mb-3">
              <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">INFORMAÇÕES GERAIS</h2>
              <div className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs grid grid-cols-1 md:grid-cols-3 gap-2">
                <p><strong>Nome da Cotação:</strong> {quotation.nome_cotacao}</p>
                <p><strong>Margem de Lucro:</strong> {quotation.porcentagem_lucro}%</p>
                <p><strong>Última Alteração:</strong> {new Date(quotation.updated_at).toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* 3. Tabela de Itens e Custos */}
            <div className="mb-3">
              <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">ITENS E CÁLCULO DE CUSTO</h2>
              <div className="border border-red-200 rounded overflow-hidden">
                <table className="w-full text-xs products-table">
                  <thead className="bg-red-100 text-black font-bold table-print-header">
                    <tr>
                      <th className="p-1.5 font-semibold text-left">Descrição</th>
                      <th className="p-1.5 font-semibold text-left">Fornecedor</th>
                      <th className="p-1.5 font-semibold text-center">Qtd</th>
                      <th className="p-1.5 font-semibold text-right">Custo Unit.</th>
                      <th className="p-1.5 font-semibold text-right">Custo Total</th>
                      <th className="p-1.5 font-semibold text-right">Lucro (R$)</th>
                      <th className="p-1.5 font-semibold text-right">Revenda (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens_cotados.map((item, index) => {
                      const custoTotalItem = item.custo_unitario * item.quantidade;
                      const precoVendaUnitario = item.custo_unitario * (1 + porcentagem_lucro / 100);
                      const precoVendaTotalItem = precoVendaUnitario * item.quantidade;
                      const lucroItem = precoVendaTotalItem - custoTotalItem;
                      
                      return (
                        <tr key={index} className="border-b border-red-100">
                          <td className="p-1.5">{item.descricao}</td>
                          <td className="p-1.5">{item.fornecedor}</td>
                          <td className="p-1.5 text-center">{item.quantidade}</td>
                          <td className="p-1.5 text-right">R$ {item.custo_unitario.toFixed(2)}</td>
                          <td className="p-1.5 text-right">R$ {custoTotalItem.toFixed(2)}</td>
                          <td className="p-1.5 text-right text-green-600 font-medium">R$ {lucroItem.toFixed(2)}</td>
                          <td className="p-1.5 text-right font-semibold text-red-600">R$ {precoVendaTotalItem.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* 4. Resumo Financeiro */}
            <div className="flex justify-end mt-4">
              <div className="w-full max-w-sm space-y-2 text-sm">
                <div className="flex justify-between"><span>Custo Total Geral:</span><span className="font-semibold">R$ {custoTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Lucro Total Estimado:</span><span className="font-semibold text-green-600">R$ {valorLucro.toFixed(2)}</span></div>
                <Separator/>
                <div className="flex justify-between text-base font-bold text-red-600"><span>Preço Venda Final (Sugestão):</span><span>R$ {precoFinalVenda.toFixed(2)}</span></div>
              </div>
            </div>

            {/* 5. Rodapé Padrão */}
            <div className="space-y-3 print:space-y-2 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                  <div className="border border-gray-300 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ASSINATURA E CARIMBO:</p><div className="h-12 print:h-8"></div><div className="border-t border-gray-300 pt-1"><p className="text-xs text-center">WARP SEGURANÇA ELETRÔNICA</p></div></div>
                  <div className="border border-gray-300 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ACEITE DO CLIENTE:</p><div className="h-12 print:h-8"></div><div className="border-t border-gray-300 pt-1"><p className="text-xs text-center">PROPOSTA APROVADA</p></div></div>
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
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer, FileText } from "lucide-react" // Importei ArrowLeft
import Image from "next/image"
import { PageHeader } from "./PageHeader"
import { type Quotation } from "@/lib/types" // Importa o tipo central
import { DocumentFooter } from "./DocumentFooter"

// --- Bloco de Constantes de Neutralização ---
const brandMascot = process.env.NEXT_PUBLIC_BRAND_MASCOT_URL;
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME;
const brandSlogan = process.env.NEXT_PUBLIC_BRAND_SLOGAN;
const brandPhone = process.env.NEXT_PUBLIC_BRAND_PHONE;
const brandEmail = process.env.NEXT_PUBLIC_BRAND_EMAIL;
const brandWebsite = process.env.NEXT_PUBLIC_BRAND_WEBSITE;
const brandCnpj = process.env.NEXT_PUBLIC_BRAND_CNPJ;
const brandAddress = process.env.NEXT_PUBLIC_BRAND_ADDRESS;
const brandCity = process.env.NEXT_PUBLIC_BRAND_CITY;
const brandIcon = process.env.NEXT_PUBLIC_BRAND_ICON;
const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL;

interface QuotationDetailProps {
  quotation: Quotation;
  onBack: () => void;
  onLogout: () => void;
  onViewQuotationList: () => void;
  onConvertToBudget: (quotation: any) => void;
}

const statusColors: { [key: string]: string } = {
  "Em cotação": "bg-blue-100 text-blue-800",
  "Aprovado": "bg-green-100 text-green-800",
  "Cancelado": "bg-destructive/20 text-red-800",
};

export function QuotationDetail({ quotation, onBack, onLogout, onViewQuotationList, onConvertToBudget }: QuotationDetailProps) {
  
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
        <Button variant="outline" onClick={onViewQuotationList} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10">
          <ArrowLeft className="h-4 w-4" /> Voltar para a Lista
        </Button>
        <Button
            onClick={() => onConvertToBudget(quotation)}
            className="bg-destructive hover:bg-destructive/90 gap-2">
            <FileText className="h-4 w-4" /> Converter em Orçamento
          </Button>
        <Button onClick={handlePrint} className="gap-2 bg-destructive hover:bg-destructive/90">
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
                {brandLogo && (
                <Image src={brandLogo} alt="Logo" width={708} height={256} quality={100} className="h-8 w-auto print:h-10" />  )}
                <div className="text-right">
                  <div className="text-xl font-bold text-destructive mb-1 print:text-2xl">COTAÇÃO INTERNA</div>
                  <Badge className={statusColors[quotation.status] || 'bg-gray-100'}>{quotation.status}</Badge>
                </div>
              </div>
            <Separator className="mb-4 print:mb-3" />

            <div className="bg-destructive/10 p-3 rounded-lg mb-4 print:mb-3 print:p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs print:text-xs">
                <div><p className="font-semibold text-destructive">{brandName}</p><p>{brandCnpj}</p></div>
                <div><p>{brandAddress}</p><p>{brandCity}</p></div>
              </div>
            </div>
            </div>

            {/* 2. Informações Gerais da Cotação */}
            <div className="mb-3">
              <h2 className="text-base font-semibold mb-1 text-destructive border-b border-destructive/40 pb-0.5">INFORMAÇÕES GERAIS</h2>
              <div className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs grid grid-cols-1 md:grid-cols-3 gap-2">
                <p><strong>Nome da Cotação:</strong> {quotation.nome_cotacao}</p>
                <p><strong>Margem de Lucro:</strong> {quotation.porcentagem_lucro}%</p>
                <p><strong>Última Alteração:</strong> {new Date(quotation.updated_at).toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* 3. Tabela de Itens e Custos */}
            <div className="mb-3">
              <h2 className="text-base font-semibold mb-1 text-destructive border-b border-destructive/40 pb-0.5">ITENS E CÁLCULO DE CUSTO</h2>
              <div className="border border-destructive/40 rounded overflow-hidden">
                <table className="w-full text-xs products-table">
                  <thead className="bg-destructive/20 text-black font-bold table-print-header">
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
                        <tr key={index} className="border border-destructive/40 p-2 print:p-1">
                          <td className="border border-destructive/40 p-1.5 print:p-1">{item.descricao}</td>
                          <td className="border border-destructive/40 p-1.5 print:p-1">{item.fornecedor}</td>
                          <td className="border border-destructive/40 p-1.5 print:p-1 text-center">{item.quantidade}</td>
                          <td className="border border-destructive/40 p-1.5 print:p-1 text-right">{item.custo_unitario.toFixed(2)}</td>
                          <td className="border border-destructive/40 p-1.5 print:p-1 text-right">{custoTotalItem.toFixed(2)}</td>
                          <td className="border border-destructive/40 p-1.5 print:p-1 text-right text-green-600 font-medium">{lucroItem.toFixed(2)}</td>
                          <td className="border border-destructive/40 p-1.5 print:p-1 text-right font-semibold text-destructive">{precoVendaTotalItem.toFixed(2)}</td>
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
                <div className="flex justify-between text-base font-bold text-destructive"><span>Preço Venda Final (Sugestão):</span><span>R$ {precoFinalVenda.toFixed(2)}</span></div>
              </div>
            </div>

            {/* 5. Rodapé Padrão */}
            <div className="space-y-3 print:space-y-2 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                  <div className="border border-destructive/40 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ASSINATURA E CARIMBO:</p><div className="h-12 print:h-8"></div><div className="border-t border-destructive/40 pt-1"><p className="text-xs text-center">{brandName}</p></div></div>
                  <div className="border border-destructive/40 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">SITUAÇÃO:</p><div className="h-12 print:h-8"></div><div className="border-t border-destructive/40 pt-1"><p className="text-xs text-center">PROPOSTA APROVADA</p></div></div>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center mt-8 print:mt-4">
              <div></div>
              <div className="flex justify-center">
                {brandIcon && (
                <Image alt="Icon" width={375} height={463} quality={100} className="w-auto h-15 opacity-100 print:h-8 object-contain" src={brandIcon} /> )}
              </div>
              <div className="flex justify-end">

                <p className="text-xs font-medium mb-2">DATA: ______ / ______ / ______</p>
              </div>
            </div>
          </CardContent>
          <div></div>
          <DocumentFooter />
        </Card>
      </div>
    </div>
  )
}
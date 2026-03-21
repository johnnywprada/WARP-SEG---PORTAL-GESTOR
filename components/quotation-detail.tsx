"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer, FileText } from "lucide-react"
import Image from "next/image"
import { type Quotation } from "@/lib/types"
import { DocumentFooter } from "./DocumentFooter"

// --- Bloco de Constantes de Neutralização ---
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";
const brandCnpj = process.env.NEXT_PUBLIC_BRAND_CNPJ || "CNPJ: 35.550.155/0001-86";
const brandAddress = process.env.NEXT_PUBLIC_BRAND_ADDRESS || "Rua barros cassal, 35";
const brandCity = process.env.NEXT_PUBLIC_BRAND_CITY || "Jardim Bom Clima - Guarulhos, SP - 07196-270";
const brandIcon = process.env.NEXT_PUBLIC_BRAND_ICON || "/images/warpicon.png";
const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";

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
  
  // --- FUNÇÕES DE CÁLCULO ---
  const { itens_cotados = [], porcentagem_lucro = 0 } = quotation;

  let custoTotal = 0;
  let valorLucro = 0;
  let precoFinalVenda = 0;

  itens_cotados.forEach((item) => {
    let custoTotalItem = item.custo_unitario * item.quantidade;
    let precoVendaUnitario = item.custo_unitario;
    let precoVendaTotalItem = 0;
    let lucroItem = 0;

    if (item.lucro_total === true) {
      custoTotalItem = 0;
      precoVendaUnitario = item.custo_unitario;
      precoVendaTotalItem = precoVendaUnitario * item.quantidade;
      lucroItem = precoVendaTotalItem;
    } else if (item.porcentagem_lucro_item !== null && item.porcentagem_lucro_item !== undefined) {
      precoVendaUnitario = item.custo_unitario * (1 + item.porcentagem_lucro_item / 100);
      precoVendaTotalItem = precoVendaUnitario * item.quantidade;
      lucroItem = precoVendaTotalItem - custoTotalItem;
    } else {
      precoVendaUnitario = item.custo_unitario * (1 + porcentagem_lucro / 100);
      precoVendaTotalItem = precoVendaUnitario * item.quantidade;
      lucroItem = precoVendaTotalItem - custoTotalItem;
    }

    custoTotal += custoTotalItem;
    valorLucro += lucroItem;
    precoFinalVenda += precoVendaTotalItem;
  });

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `COTAÇÃO - ${quotation.nome_cotacao}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans w-full overflow-x-hidden print:overflow-x-visible print:bg-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* BARRA DE AÇÕES */}
      <div className="sticky top-0 bg-white border-b shadow-sm z-50 p-4 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
          <Button variant="outline" onClick={onViewQuotationList} className="gap-2 w-full sm:w-auto text-destructive border-destructive/40 hover:bg-destructive/10">
            <ArrowLeft className="h-4 w-4" /> Voltar para a Lista
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button onClick={() => onConvertToBudget(quotation)} className="bg-destructive hover:bg-destructive/90 gap-2 w-full sm:w-auto shadow-sm">
              <FileText className="h-4 w-4" /> Converter em Orçamento
            </Button>
            <Button onClick={handlePrint} variant="outline" className="gap-2 w-full sm:w-auto text-slate-700 hover:bg-slate-100 border-slate-300 shadow-sm">
              <Printer className="h-4 w-4" /> Imprimir / PDF
            </Button>
          </div>
        </div>
      </div>
      
      {/* VIEWPORT VIRTUAL CORRIGIDO: Removido o "flex justify-center" daqui! */}
      <div className="flex-grow py-4 sm:py-8 w-full overflow-x-auto print:overflow-x-visible px-2 sm:px-0 pb-8">
        
        {/* A FOLHA A4 */}
        <div className="w-full min-w-[700px] max-w-[210mm] mx-auto bg-white shadow-xl p-6 sm:p-12 print:p-0 print:shadow-none print:max-w-none print:w-full print:block box-border">
          
          {/* 1. Cabeçalho do Documento */}
          <div className="mb-4 print:mb-3 break-inside-avoid">
            <div className="flex justify-between items-end mb-4 pt-2 gap-4">
              {brandLogo && (
                <Image src={brandLogo} alt="Logo" width={400} height={150} quality={100} className="h-12 w-auto object-contain print:h-10" />  
              )}
              <div className="text-right">
                <div className="text-2xl font-bold uppercase tracking-tight text-destructive mb-1 print:text-xl">COTAÇÃO INTERNA</div>
                <Badge className={`${statusColors[quotation.status] || 'bg-gray-100'} border-none px-2 py-0 h-5 text-xs`}>
                  {quotation.status}
                </Badge>
              </div>
            </div>
            
            <Separator className="mb-4 print:mb-3 bg-red-100" />

            <div className="bg-destructive/5 border border-red-100 p-3 rounded-lg mb-4 print:mb-3 print:p-2">
              <div className="grid grid-cols-2 gap-4 text-xs print:text-xs">
                <div><p className="font-bold text-destructive">{brandName}</p><p className="text-gray-600">{brandCnpj}</p></div>
                <div className="text-right"><p className="text-gray-600">{brandAddress}</p><p className="text-gray-600">{brandCity}</p></div>
              </div>
            </div>
          </div>

          {/* 2. Informações Gerais da Cotação */}
          <div className="mb-6 print:mb-4 break-inside-avoid">
            <h2 className="text-sm font-bold uppercase mb-2 text-destructive">Informações Gerais</h2>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded grid grid-cols-3 gap-4 text-xs">
              <p><strong className="text-gray-600 block mb-1">Nome da Cotação:</strong> <span className="text-gray-800 font-medium">{quotation.nome_cotacao}</span></p>
              <p><strong className="text-gray-600 block mb-1">Margem Padrão:</strong> <span className="text-gray-800 font-medium">{quotation.porcentagem_lucro}%</span></p>
              <p><strong className="text-gray-600 block mb-1">Última Alteração:</strong> <span className="text-gray-800 font-medium">{new Date(quotation.updated_at).toLocaleString('pt-BR')}</span></p>
            </div>
          </div>

          {/* 3. Tabela de Itens e Custos */}
          <div className="mb-6 print:mb-4 w-full">
            <h2 className="text-sm font-bold uppercase mb-2 text-destructive">Itens e Cálculo de Custo</h2>
            <div className="rounded border overflow-hidden" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>
              <table className="w-full text-xs border-collapse">
                <thead className="bg-destructive/10 text-destructive uppercase">
                  <tr>
                    <th className="p-2 font-bold text-left border-b border-red-200">Descrição</th>
                    <th className="p-2 font-bold text-left border-b border-l border-red-200">Fornecedor</th>
                    <th className="p-2 font-bold text-center border-b border-l border-red-200 w-12">Qtd</th>
                    <th className="p-2 font-bold text-right border-b border-l border-red-200 w-20">Custo Un.</th>
                    <th className="p-2 font-bold text-right border-b border-l border-red-200 w-20">Custo Tot.</th>
                    <th className="p-2 font-bold text-right border-b border-l border-red-200 w-20">Lucro</th>
                    <th className="p-2 font-bold text-right border-b border-l border-red-200 w-20">Revenda</th>
                  </tr>
                </thead>
                <tbody>
                  {itens_cotados.map((item, index) => {
                    let custoTotalItem = item.custo_unitario * item.quantidade;
                    let precoVendaUnitario = item.custo_unitario;
                    let precoVendaTotalItem = 0;
                    let lucroItem = 0;

                    if (item.lucro_total === true) {
                      custoTotalItem = 0;
                      precoVendaUnitario = item.custo_unitario; 
                      precoVendaTotalItem = precoVendaUnitario * item.quantidade;
                      lucroItem = precoVendaTotalItem;
                    } else if (item.porcentagem_lucro_item !== null && item.porcentagem_lucro_item !== undefined) {
                      precoVendaUnitario = item.custo_unitario * (1 + item.porcentagem_lucro_item / 100);
                      precoVendaTotalItem = precoVendaUnitario * item.quantidade;
                      lucroItem = precoVendaTotalItem - custoTotalItem;
                    } else {
                      precoVendaUnitario = item.custo_unitario * (1 + porcentagem_lucro / 100);
                      precoVendaTotalItem = precoVendaUnitario * item.quantidade;
                      lucroItem = precoVendaTotalItem - custoTotalItem;
                    }

                    return (
                      <tr key={index} className="break-inside-avoid" style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "rgba(220, 38, 38, 0.05)" }}>
                        <td className="p-2 border-b border-red-50 text-gray-800">{item.descricao}</td>
                        <td className="p-2 border-b border-l border-red-50 text-gray-600">{item.fornecedor}</td>
                        <td className="p-2 border-b border-l border-red-50 text-center font-medium">{item.quantidade}</td>
                        <td className="p-2 border-b border-l border-red-50 text-right whitespace-nowrap">
                          R$ {item.lucro_total ? "0,00" : Number(item.custo_unitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 border-b border-l border-red-50 text-right whitespace-nowrap">R$ {custoTotalItem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 border-b border-l border-red-50 text-right text-green-600 font-medium whitespace-nowrap">R$ {lucroItem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2 border-b border-l border-red-50 text-right font-bold text-destructive whitespace-nowrap">R$ {precoVendaTotalItem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 4. Resumo Financeiro */}
          <div className="flex justify-end mt-6 mb-8 print:mt-4 break-inside-avoid">
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-600">Custo Total Geral:</span><span className="font-semibold text-gray-800">R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-600">Lucro Total Estimado:</span><span className="font-semibold text-green-600">R$ {valorLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-base font-bold text-destructive pt-1"><span>Preço de Venda Sugerido:</span><span>R$ {precoFinalVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
            </div>
          </div>

          {/* 5. Rodapé de Assinaturas */}
          <div className="print:break-inside-avoid w-full">
            <div className="grid grid-cols-2 gap-12 mt-10 mb-6 print:gap-8">
              <div className="text-center w-full">
                <p className="text-xs font-bold text-destructive mb-8 uppercase">SITUAÇÃO DA PROPOSTA</p>
                <div className="h-10 border-b border-black/50 mb-2 w-full"></div>
                <p className="text-[10px] text-gray-500 uppercase">Cotação Aprovada / Assinatura</p>
              </div>
              <div className="text-center w-full">
                <p className="text-xs font-bold text-destructive mb-8 uppercase">ASSINATURA E CARIMBO</p>
                <div className="h-10 border-b border-black/50 mb-2 w-full"></div>
                <p className="text-[10px] text-gray-500 uppercase">{brandName}</p>
              </div>
            </div>

            <div className="flex justify-between items-end px-4 mt-8 print:mt-4">
              <div className="w-1/3"></div>
              <div className="w-1/3 flex justify-center">
                {brandIcon && (
                <Image alt="Icon" width={375} height={463} quality={100} className="w-auto h-12 opacity-60 print:h-8 object-contain" src={brandIcon} /> )}
              </div>
              <div className="w-1/3 text-right">
                <p className="text-xs font-bold text-gray-500">DATA: ______ / ______ / ______</p>
              </div>
            </div>
          </div>
          
          {/* Rodapé Dinâmico */}
          <div className="mt-8 print:mt-4 w-full">
            <DocumentFooter />
          </div>

        </div>
      </div>
    </div>
  )
}
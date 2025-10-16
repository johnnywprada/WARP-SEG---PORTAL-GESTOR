"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "./PageHeader"
import { Printer } from "lucide-react"

// --- TIPOS E INTERFACES ---
export interface QuotationItem {
  descricao: string;
  fornecedor: string;
  quantidade: number;
  custo_unitario: number;
}

export interface Quotation {
  id: string;
  nome_cotacao: string;
  status: string;
  created_at: string;
  updated_at: string;
  porcentagem_lucro: number;
  itens_cotados: QuotationItem[];
}

export interface QuotationDetailProps {
  quotation: Quotation;
  onBack: () => void;
  onEdit: () => void;
  onLogout: () => void;
}

const statusColors: { [key: string]: string } = {
  "Em cotação": "bg-blue-100 text-blue-800",
  "Aprovado": "bg-green-100 text-green-800",
  "Cancelado": "bg-red-100 text-red-800",
};

export function QuotationDetail({ quotation, onBack, onEdit, onLogout }: QuotationDetailProps) {
  const custoTotal = quotation.itens_cotados.reduce((sum, item) => sum + (item.custo_unitario * item.quantidade), 0);
  const precoFinalVenda = custoTotal * (1 + quotation.porcentagem_lucro / 100);
  const valorLucro = precoFinalVenda - custoTotal;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `COTAÇÃO - ${quotation.nome_cotacao}`;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Detalhes da Cotação"
        onBackToMenu={onBack}
        onLogout={onLogout}
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex justify-end gap-2 mb-6">
            <Button variant="outline" onClick={onEdit} className="gap-2">
                <Edit className="h-4 w-4"/> Editar Cotação
            </Button>
            <div className="flex justify-end mt-6">
          <Button onClick={handlePrint} className="gap-2 bg-red-600 hover:bg-red-700">
            <Printer className="h-4 w-4"/>Imprimir / Salvar PDF
          </Button>
        </div>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{quotation.nome_cotacao}</CardTitle>
                    <Badge className={statusColors[quotation.status] || 'bg-gray-100'}>{quotation.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground pt-2">
                    <p>Criada em: {new Date(quotation.created_at).toLocaleString('pt-BR')}</p>
                    <p>Última alteração: {new Date(quotation.updated_at).toLocaleString('pt-BR')}</p>
                    <p>Margem de Lucro Definida: <strong>{quotation.porcentagem_lucro}%</strong></p>
                </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader><CardTitle>Itens Cotados</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="py-2">Descrição</th>
                    <th className="py-2">Fornecedor</th>
                    <th className="py-2 text-center">Qtd</th>
                    <th className="py-2 text-right">Custo Unit.</th>
                    <th className="py-2 text-right">Custo Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.itens_cotados.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.descricao}</td>
                      <td className="py-2 text-muted-foreground">{item.fornecedor}</td>
                      <td className="py-2 text-center">{item.quantidade}</td>
                      <td className="py-2 text-right">R$ {item.custo_unitario.toFixed(2)}</td>
                      <td className="py-2 text-right font-medium">R$ {(item.custo_unitario * item.quantidade).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Resumo Financeiro</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Custo Total dos Materiais:</span><span className="font-medium">R$ {custoTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Valor Total do Lucro ({quotation.porcentagem_lucro}%):</span><span className="font-medium text-green-600">R$ {valorLucro.toFixed(2)}</span></div>
              <Separator/>
              <div className="flex justify-between text-base font-bold text-red-600"><span>Preço Final de Venda (Sugestão):</span><span>R$ {precoFinalVenda.toFixed(2)}</span></div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  )
}
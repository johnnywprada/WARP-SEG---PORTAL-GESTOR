// components/data-export.tsx

"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { PageHeader } from "./PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Table } from "lucide-react"

interface DataExportProps {
  onBackToMenu: () => void
  onLogout: () => void
}

export function DataExport({ onBackToMenu, onLogout }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToHTML = async () => {
    setIsExporting(true)
    try {
      const { data: budgets, error: budgetError } = await supabase.from("orcamentos").select("*")
      const { data: serviceOrders, error: osError } = await supabase.from("ordens_servico").select("*")

      if (budgetError || osError) {
        throw new Error(budgetError?.message || osError?.message)
      }

      // Função segura para formatar datas, evitando o erro "Invalid Date"
      const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Data Inválida";
        return date.toLocaleDateString("pt-BR");
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório - WARP</title>
          <style> body { font-family: Arial, sans-serif; } h1, h2 { color: #dc2626; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; } </style>
        </head>
        <body>
          <h1>Relatório Completo - WARP Segurança Eletrônica</h1>
          <p>Data: ${new Date().toLocaleDateString("pt-BR")}</p>
          
          <h2>Orçamentos (${budgets?.length || 0} registros)</h2>
          <table>
            <thead><tr><th>Número</th><th>Cliente</th><th>Contato</th><th>Total</th><th>Status</th><th>Data</th></tr></thead>
            <tbody>
              ${budgets?.map((b: any) => `
                <tr>
                  <td>${b.budgetNumber}</td>
                  <td>${b.client.name}</td>
                  <td>${b.client.phone}</td>
                  <td>R$ ${b.totalValue.toFixed(2)}</td>
                  <td>${b.status}</td>
                  <td>${formatDate(b.created_at)}</td>
                </tr>`).join("") || '<tr><td colspan="6">Nenhum orçamento encontrado.</td></tr>'}
            </tbody>
          </table>

          <h2>Ordens de Serviço (${serviceOrders?.length || 0} registros)</h2>
          <table>
            <thead><tr><th>Número</th><th>Cliente</th><th>Contato</th><th>Tipo</th><th>Status</th><th>Data</th></tr></thead>
            <tbody>
              ${serviceOrders?.map((os: any) => `
                <tr>
                  <td>${os.osnumber}</td>
                  <td>${os.cliente_nome}</td>
                  <td>${os.cliente_telefone}</td>
                  <td>${os.servicetype}</td>
                  <td>${os.status}</td>
                  <td>${formatDate(os.created_at)}</td>
                </tr>`).join("") || '<tr><td colspan="6">Nenhuma ordem de serviço encontrada.</td></tr>'}
            </tbody>
          </table>
        </body>
        </html>
      `
      
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-warp-${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error: any) {
      console.error("Erro ao exportar HTML:", error)
      alert("Erro ao exportar dados: " + error.message)
    }
    setIsExporting(false)
  }

  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      const { data: budgets, error: budgetError } = await supabase.from("orcamentos").select("*")
      const { data: serviceOrders, error: osError } = await supabase.from("ordens_servico").select("*")

      if (budgetError || osError) {
        throw new Error(budgetError?.message || osError?.message)
      }
      
      const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Data Inválida";
        return date.toLocaleDateString("pt-BR");
      };

      const headers = ["Tipo", "Número", "Cliente", "Email", "Telefone", "Total", "Status", "Data"]
      
      const budgetRows = budgets?.map((b: any) => [
        "Orçamento", b.budgetNumber, b.client.name, b.client.email, b.client.phone, b.totalValue.toFixed(2), b.status, 
        // AQUI ESTÁ A CORREÇÃO 2
        formatDate(b.created_at),
      ]) || []

      const osRows = serviceOrders?.map((os: any) => [
        "Ordem de Serviço", os.osnumber, os.cliente_nome, os.cliente_email, os.cliente_telefone, "-", os.status, formatDate(os.created_at),
      ]) || []

      const allRows = [headers, ...budgetRows, ...osRows]
      const csvContent = allRows.map((row) => row.map((field) => `"${String(field || '').replace(/"/g, '""')}"`).join(",")).join("\n")

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dados-warp-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error: any) {
      console.error("Erro ao exportar CSV:", error)
      alert("Erro ao exportar dados: " + error.message)
    }
    setIsExporting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Exportação de Dados"
        onBackToMenu={onBackToMenu}
        onLogout={onLogout}
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-red-600 mb-2">Relatórios Completos</h2>
            <p className="text-muted-foreground">Exporte todos os dados do sistema em diferentes formatos</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg border-red-100">
            <CardHeader className="text-center">
              <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4"><FileText className="h-8 w-8 text-red-600" /></div>
              <CardTitle className="text-xl">Exportar para HTML</CardTitle>
              <CardDescription>Gera um relatório visual completo para impressão ou visualização no navegador.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportToHTML} disabled={isExporting} className="w-full bg-red-600 hover:bg-red-700">
                <Download className="h-4 w-4 mr-2" /> {isExporting ? "Exportando..." : "Baixar Relatório HTML"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-green-100">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4"><Table className="h-8 w-8 text-green-600" /></div>
              <CardTitle className="text-xl">Exportar para CSV</CardTitle>
              <CardDescription>Gera uma planilha para análise no Excel, Google Sheets ou outros programas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportToCSV} disabled={isExporting} className="w-full bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" /> {isExporting ? "Exportando..." : "Baixar Planilha CSV"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
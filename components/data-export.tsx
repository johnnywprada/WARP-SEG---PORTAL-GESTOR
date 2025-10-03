"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Table } from "lucide-react"

interface DataExportProps {
  onBack: () => void
}

export function DataExport({ onBack }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    setIsExporting(true)

    try {
      const budgets = JSON.parse(localStorage.getItem("warp-budgets") || "[]")
      const serviceOrders = JSON.parse(localStorage.getItem("warp-service-orders") || "[]")

      // Criar conteúdo HTML para PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório Completo - WARP Segurança Eletrônica</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #dc2626; padding-bottom: 20px; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #dc2626; border-bottom: 1px solid #dc2626; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #dc2626; color: white; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status.em-aberto { background-color: #fef3c7; color: #92400e; }
            .status.instalando { background-color: #dbeafe; color: #1e40af; }
            .status.concluido { background-color: #d1fae5; color: #065f46; }
            .status.cancelado { background-color: #fee2e2; color: #991b1b; }
            .status.agendado { background-color: #e0e7ff; color: #3730a3; }
            .status.em-andamento { background-color: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>WARP SEGURANÇA ELETRÔNICA</h1>
            <p>Relatório Completo do Sistema de Gestão</p>
            <p>Data: ${new Date().toLocaleDateString("pt-BR")}</p>
          </div>
          
          <div class="section">
            <h2>Orçamentos (${budgets.length} registros)</h2>
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                ${budgets
                  .map(
                    (budget: any) => `
                  <tr>
                    <td>${budget.budgetNumber || budget.number}</td>
                    <td>${budget.client?.name || budget.clientName}</td>
                    <td>${budget.client?.phone || budget.clientPhone}</td>
                    <td>R$ ${budget.totalValue?.toFixed(2) || budget.total?.toFixed(2) || "0,00"}</td>
                    <td><span class="status ${budget.status}">${budget.status}</span></td>
                    <td>${new Date(budget.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2>Ordens de Serviço (${serviceOrders.length} registros)</h2>
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Contato</th>
                  <th>Tipo de Serviço</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                ${serviceOrders
                  .map(
                    (os: any) => `
                  <tr>
                    <td>${os.osNumber || os.number}</td>
                    <td>${os.client?.name || os.clientName}</td>
                    <td>${os.client?.phone || os.clientPhone}</td>
                    <td>${os.serviceType}</td>
                    <td><span class="status ${os.status}">${os.status}</span></td>
                    <td>${new Date(os.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `

      // Criar e baixar PDF
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-warp-${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      alert("Erro ao exportar dados. Tente novamente.")
    }

    setIsExporting(false)
  }

  const exportToCSV = () => {
    setIsExporting(true)

    try {
      const budgets = JSON.parse(localStorage.getItem("warp-budgets") || "[]")
      const serviceOrders = JSON.parse(localStorage.getItem("warp-service-orders") || "[]")

      // CSV dos Orçamentos
      const budgetHeaders = ["Tipo", "Número", "Cliente", "Email", "Telefone", "Endereço", "Total", "Status", "Data"]
      const budgetRows = budgets.map((budget: any) => [
        "Orçamento",
        budget.budgetNumber || budget.number,
        budget.client?.name || budget.clientName,
        budget.client?.email || budget.clientEmail,
        budget.client?.phone || budget.clientPhone,
        budget.client?.address || budget.clientAddress,
        budget.totalValue?.toFixed(2) || budget.total?.toFixed(2) || "0,00",
        budget.status,
        new Date(budget.createdAt).toLocaleDateString("pt-BR"),
      ])

      // CSV das Ordens de Serviço
      const osRows = serviceOrders.map((os: any) => [
        "Ordem de Serviço",
        os.osNumber || os.number,
        os.client?.name || os.clientName,
        os.client?.email || os.clientEmail,
        os.client?.phone || os.clientPhone,
        os.client?.address || os.clientAddress,
        "-",
        os.status,
        new Date(os.createdAt).toLocaleDateString("pt-BR"),
      ])

      // Combinar todos os dados
      const allRows = [budgetHeaders, ...budgetRows, ...osRows]
      const csvContent = allRows.map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

      // Baixar CSV
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dados-warp-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro ao exportar CSV:", error)
      alert("Erro ao exportar dados. Tente novamente.")
    }

    setIsExporting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4 bg-transparent">
            ← Voltar ao Menu
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Exportação de Dados</h1>
            <p className="text-slate-600">Exporte todos os dados do sistema em diferentes formatos</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-50 p-3 rounded-full">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-slate-800">Exportar para HTML</CardTitle>
              <CardDescription>
                Gera um relatório completo em formato HTML com todos os orçamentos e ordens de serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={exportToPDF}
                disabled={isExporting}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exportando..." : "Baixar Relatório HTML"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-50 p-3 rounded-full">
                  <Table className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-slate-800">Exportar para CSV</CardTitle>
              <CardDescription>
                Gera uma planilha CSV com todos os dados para análise no Excel ou Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={exportToCSV}
                disabled={isExporting}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exportando..." : "Baixar Planilha CSV"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Informações sobre a Exportação:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• O arquivo HTML pode ser aberto em qualquer navegador e impresso</li>
            <li>• O arquivo CSV pode ser aberto no Excel, Google Sheets ou outros programas de planilha</li>
            <li>• Os dados incluem todos os orçamentos e ordens de serviço salvos no sistema</li>
            <li>• A exportação é feita localmente, seus dados não são enviados para nenhum servidor</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

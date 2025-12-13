"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { PageHeader } from "./PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Table } from "lucide-react"
import { formatStructuredService } from "@/lib/serviceUtils"

// --- Bloco de Constantes de Neutralização ---
const brandMascot = process.env.NEXT_PUBLIC_BRAND_MASCOT_URL || "/images/WARP-mascot.png";
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";
const brandSlogan = process.env.NEXT_PUBLIC_BRAND_SLOGAN || "Especialistas em segurança eletrônica oferecendo soluções completas para proteger o que é mais importante para você.";
const brandPhone = process.env.NEXT_PUBLIC_BRAND_PHONE || "(11) 95990-2308";
const brandEmail = process.env.NEXT_PUBLIC_BRAND_EMAIL || "johnnywprada@gmail.com";
const brandWebsite = process.env.NEXT_PUBLIC_BRAND_WEBSITE || "https://warpseg.vercel.app";
const brandCnpj = process.env.NEXT_PUBLIC_BRAND_CNPJ || "CNPJ: 35.550.155/0001-86";
const brandAddress = process.env.NEXT_PUBLIC_BRAND_ADDRESS || "Rua barros cassal, 35";
const brandCity = process.env.NEXT_PUBLIC_BRAND_CITY || "Jardim Bom Clima - Guarulhos, SP - 07196-270";
const brandIcon = process.env.NEXT_PUBLIC_BRAND_ICON || "/images/warpicon.png";
const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/WARP-logo.png";
const brandDominio = process.env.NEXT_PUBLIC_BRAND_DOMINIO || "https://warpseggestao.vercel.app"

interface DataExportProps {
  onBackToMenu: () => void
  onLogout: () => void
}

export function DataExport({ onBackToMenu, onLogout }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToHTML = async () => {
    setIsExporting(true)
    try {
      // Usa a variável de ambiente para o 'baseUrl'
      const baseUrl = brandDominio || "https://portaldefseg.vercel.app"; // Garante um fallback

      const { data: budgets, error: budgetError } = await supabase.from("orcamentos").select("*")
      const { data: serviceOrders, error: osError } = await supabase.from("ordens_servico").select("*")

      if (budgetError || osError) throw new Error(budgetError?.message || osError?.message);
      const formatDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("pt-BR") : "N/A";

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório Completo - ${brandName}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 2rem; background-color: #f9fafb; color: #111827; }
                .container { max-width: 1024px; margin: auto; }
                .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem; }
                .header img { max-width: 250px; margin-bottom: 1rem; }
                h1 { font-size: 2.25rem; color: #007fff; margin: 0; }
                h2 { font-size: 1.5rem; color: #007fff; border-bottom: 1px solid #d6ebff; padding-bottom: 0.5rem; margin-top: 3rem; }
                p { font-size: 0.875rem; color: #6b7280; }
                table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                th, td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; font-size: 0.875rem; }
                thead { background-color: #f3f4f6; }
                th { font-weight: 600; }
                tbody tr:nth-child(odd) { background-color: #f9fafb; }
                .footer { text-align: center; margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 0.75rem; }
                .footer img { height: 40px; margin-bottom: 0.5rem; opacity: 0.7; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${baseUrl}${brandLogo}" alt="Logo">
                    <h1>Relatório Completo - ${brandName}</h1>
                    <p>Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
                </div>
                
                <h2>Orçamentos (${budgets?.length || 0} registros)</h2>
                <table>
                    <thead><tr><th>Número</th><th>Cliente</th><th>Contato</th><th>Total</th><th>Status</th><th>Data</th></tr></thead>
                    <tbody>
                        ${budgets?.map((b: any) => `<tr><td>${b.budgetNumber}</td><td>${b.client.name}</td><td>${b.client.phone}</td><td>R$ ${b.totalValue.toFixed(2)}</td><td>${b.status}</td><td>${formatDate(b.created_at)}</td></tr>`).join("") || '<tr><td colspan="6">Nenhum orçamento.</td></tr>'}
                    </tbody>
                </table>

                <h2>Ordens de Serviço (${serviceOrders?.length || 0} registros)</h2>
                <table>
                    <thead><tr><th>Número</th><th>Cliente</th><th>Contato</th><th>Tipo de Serviço</th><th>Status</th><th>Data</th></tr></thead>
                    <tbody>
                        ${serviceOrders?.map((os: any) => `<tr><td>${os.osnumber}</td><td>${os.cliente_nome}</td><td>${os.cliente_telefone}</td><td>${formatStructuredService(os.servicetype)}</td><td>${os.status}</td><td>${formatDate(os.created_at)}</td></tr>`).join("") || '<tr><td colspan="6">Nenhuma O.S</td></tr>'}
                    </tbody>
                </table>

                <div class="footer">
                    ${brandMascot ? `<img src="${baseUrl}${brandMascot}" alt="Mascote">` : ''}
                    <p>&copy; ${new Date().getFullYear()} ${brandName}. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Nome do arquivo neutralizado
      a.download = `relatorio-completo-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error("Erro ao exportar HTML:", error);
      alert("Erro ao exportar dados: " + error.message);
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

      const headers = [
        "ID do Registro", "Tipo de Registro", "Número", "Status", "Data de Criação", 
        "Cliente Nome", "Cliente Contato", "Cliente Email", "Cliente Endereço", 
        "Item/Serviço Descrição", "Item Quantidade", "Item Valor Unit.", "Item Total", 
        "Valor Total do Documento", "Observações"
      ];
      
      const budgetRows = budgets?.flatMap((b: any) => 
        b.products.map((p: any) => [
          b.id, "Orçamento", b.budgetNumber, b.status, formatDate(b.created_at),
          b.client.name, b.client.phone, b.client.email, b.client.address,
          p.description, p.quantity, p.unitPrice.toFixed(2), p.total.toFixed(2),
          b.totalValue.toFixed(2), b.observations
        ])
      ) || [];

      const osRows = serviceOrders?.map((os: any) => [
        os.id, "Ordem de Serviço", os.osnumber, os.status, formatDate(os.created_at),
        os.cliente_nome, os.cliente_telefone, os.cliente_email, os.cliente_endereco,
        formatStructuredService(os.servicetype), 
        "1", "N/A", "N/A", "N/A", os.observations
      ]) || [];

      const allRows = [headers, ...budgetRows, ...osRows];
      
      const csvContent = allRows.map(row => row.map((field: any) => `"${String(field || '').replace(/"/g, '""')}"`).join(",")).join("\n");

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Nome do arquivo neutralizado
      a.download = `relatorio-completo-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error("Erro ao exportar CSV:", error)
      alert("Erro ao exportar dados: " + error.message)
    }
    setIsExporting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Exportação de Dados - WARP"
        onBackToMenu={onBackToMenu}
        onLogout={onLogout}
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-destructive mb-2">Relatórios Completos</h2>
            <p className="text-muted-foreground">Exporte todos os dados do sistema em diferentes formatos</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg border-destructive">
            <CardHeader className="text-center">
              <div className="mx-auto bg-destructive/20 p-3 rounded-full w-fit mb-4"><FileText className="h-8 w-8 text-destructive" /></div>
              <CardTitle className="text-xl">Exportar para HTML</CardTitle>
              <CardDescription>Gera um relatório visual completo para impressão ou visualização no navegador.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportToHTML} disabled={isExporting} className="w-full bg-destructive hover:bg-destructive/90">
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

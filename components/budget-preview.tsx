"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Image from "next/image"
import { DocumentFooter } from "./DocumentFooter"

// --- Bloco de Constantes de Neutralização ---
const brandMascot = process.env.NEXT_PUBLIC_BRAND_MASCOT_URL || "/images/warp-mascot.png";
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";
const brandSlogan = process.env.NEXT_PUBLIC_BRAND_SLOGAN || "Especialistas em segurança eletrônica oferecendo soluções completas para proteger o que é mais importante para você.";
const brandPhone = process.env.NEXT_PUBLIC_BRAND_PHONE || "(11) 95990-2308";
const brandEmail = process.env.NEXT_PUBLIC_BRAND_EMAIL || "johnnywprada@gmail.com";
const brandWebsite = process.env.NEXT_PUBLIC_BRAND_WEBSITE || "www.warpseg.com.br";
const brandCnpj = process.env.NEXT_PUBLIC_BRAND_CNPJ || "CNPJ: 35.550.155/0001-86";
const brandAddress = process.env.NEXT_PUBLIC_BRAND_ADDRESS || "Rua barros cassal, 35";
const brandCity = process.env.NEXT_PUBLIC_BRAND_CITY || "Jardim Bom Clima - Guarulhos, SP - 07196-270";
const brandIcon = process.env.NEXT_PUBLIC_BRAND_ICON || "/images/warpicon.png";
const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";

// Interfaces adaptadas para os dados do formulário
interface Product { id: string; description: string; quantity: number; unit: string; unitPrice: number; total: number; }
interface ClientData { name: string; address: string; phone: string; email: string; }
interface BudgetData { client: ClientData; products: Product[]; paymentMethod: string; observations: string; validUntil: string; budgetNumber: string; }
interface BudgetPreviewProps { budgetData: BudgetData; onBack: () => void; }

export function BudgetPreview({ budgetData, onBack, }: BudgetPreviewProps) {
  const getTotalBudget = () => {
    return budgetData.products.reduce((sum, product) => sum + product.total, 0)
  }

  const handlePrint = () => {
    window.print()
  }
  
  const currentDate = new Date().toLocaleDateString("pt-BR")

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      {/* Container do papel timbrado para impressão */}
      <div className="print-only print-background-container"></div>

      {/* Cabeçalho da página (só aparece na tela) */}
      <div className="no-print sticky top-0 bg-background border-b p-4 flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10">
          <ArrowLeft className="h-4 w-4" /> Voltar para a Lista
        </Button>
        <Button onClick={handlePrint} className="gap-2 bg-destructive hover:bg-destructive/90">
          <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
        </Button>
      </div>

      <div className="container mx-auto p-2 max-w-4xl print:p-0 print:max-w-none">
        <Card className="print-page border-red-100 print:border-0 print:shadow-none"> 
        <CardContent className="p-4 print:p-6">
            <div className="flex items-center justify-between mb-4 print:mb-3">
              {brandLogo && (
              <Image src={brandLogo} alt="Logo" width={708} height={256} quality={100} className="h-16 w-auto print:h-10" /> )}
              <div className="text-right">
                <h1 className="text-xl font-bold text-destructive print:text-lg">ORÇAMENTO</h1>
                <p className="text-sm font-semibold">{budgetData.budgetNumber}</p>
              </div>
            </div>

            <Separator className="mb-4 print:mb-3" />

            <div className="bg-destructive/10 p-3 rounded-lg mb-4 print:mb-3 print:p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs print:text-xs">
                <div><p className="font-semibold text-destructive">{brandName}</p><p>{brandCnpj}</p></div>
                <div><p>{brandAddress}</p><p>{brandCity}</p></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 print:mb-3">
              <div>
                <h3 className="font-semibold text-destructive mb-2 print:text-sm">DADOS DO CLIENTE</h3>
                <div className="space-y-1 text-sm print:text-xs">
                  <p><span className="font-medium">Nome:</span> {budgetData.client.name}</p>
                  {budgetData.client.phone && (<p><span className="font-medium">Telefone:</span> {budgetData.client.phone}</p>)}
                  {budgetData.client.email && (<p><span className="font-medium">E-mail:</span> {budgetData.client.email}</p>)}
                  {budgetData.client.address && (<p><span className="font-medium">Endereço:</span> {budgetData.client.address}</p>)}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-destructive mb-2 print:text-sm">INFORMAÇÕES DO ORÇAMENTO</h3>
                <div className="space-y-1 text-sm print:text-xs">
                  <p><span className="font-medium">Data:</span> {currentDate}</p>
                  {budgetData.validUntil && (<p><span className="font-medium">Válido até:</span> {new Date(budgetData.validUntil).toLocaleDateString("pt-BR")}</p>)}
                  {budgetData.paymentMethod && (<p><span className="font-medium">Pagamento:</span> {budgetData.paymentMethod}</p>)}
                </div>
              </div>
            </div>

            <Separator className="mb-4 print:mb-3" />

            <div className="mb-4 print:mb-3">
              <h3 className="font-semibold text-destructive mb-2 print:text-sm">PRODUTOS/SERVIÇOS</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-destructive/40 text-sm print:text-xs products-table">
                  <thead><tr className="bg-red-200 text-black font-bold"><th className="border border-destructive/40 p-2 text-left print:p-1">Descrição</th><th className="border border-destructive/40 p-2 text-center print:p-1">Qtd</th><th className="border border-destructive/40 p-2 text-center print:p-1">Un.</th><th className="border border-destructive/40 p-2 text-right print:p-1">Valor Unit.</th><th className="border border-destructive/40 p-2 text-right print:p-1">Total</th></tr></thead>
                  <tbody>
  {budgetData.products.map((product, index) => (
    <tr key={product.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
      
      {/* Coluna 1: Descrição */}
      <td className="border border-destructive/40 p-2 print:p-1">{product.description}</td>
      
      {/* Coluna 2: Quantidade */}
      <td className="border border-destructive/40 p-2 text-center print:p-1">{product.quantity}</td>
      
      {/* Coluna 3: Unidade */}
      <td className="border border-destructive/40 p-2 text-center print:p-1">{product.unit}</td>
      
      {/* Coluna 4: Valor Unitário */}
      <td className="border border-destructive/40 p-2 text-right print:p-1">
        R$ {product.unitPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </td>
      
      {/* Coluna 5: Total */}
      <td className="border border-destructive/40 p-2 text-right print:p-1">
        R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </td>

    </tr>
  ))}
</tbody>
                  <tfoot><tr className="bg-red-200 text-black font-bold"><td colSpan={4} className="border border-destructive/40 p-2 text-right print:p-1">TOTAL GERAL:</td><td className="border border-destructive/40 p-2 text-right print:p-1">R$ {getTotalBudget().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr></tfoot>
                </table>
              </div>
            </div>

            {budgetData.observations && (
              <div className="mb-4 print:mb-3">
                <h3 className="font-semibold text-destructive mb-2 print:text-sm">OBSERVAÇÕES</h3>
                <p className="text-sm bg-gray-50 p-2 rounded print:text-xs print:p-1">{budgetData.observations}</p>
              </div>
            )}

            <div className="space-y-3 print:space-y-2">
              <div className="bg-destructive/10 border border-destructive/40 p-3 rounded print:p-2">
                <p className="text-xs font-semibold text-destructive mb-1">IMPORTANTE:</p>
                <p className="text-xs text-destructive">Este orçamento é válido somente mediante assinatura e carimbo oficial da {brandName}. Orçamentos não assinados não possuem validade comercial.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                <div className="border border-destructive/40 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ASSINATURA E CARIMBO:</p><div className="h-12 print:h-8"></div><div className="border-t border-destructive/40 pt-1"><p className="text-xs text-center">{brandName}</p></div></div>
                <div className="border border-destructive/40 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ACEITE DO CLIENTE:</p><div className="h-12 print:h-8"></div><div className="border-t border-destructive/40 pt-1"><p className="text-xs text-center">CLIENTE</p></div></div>
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

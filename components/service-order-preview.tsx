"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react" // Removemos Printer e Share2 daqui
import Image from "next/image"
import { formatStructuredService } from "@/lib/serviceUtils"
import { type ServiceOrderData } from "@/lib/types"
import { DocumentFooter } from "./DocumentFooter"
import { Separator } from "@/components/ui/separator"
import { DocumentActions } from "./share-image-button" // <--- Importamos o novo componente

// --- Constantes (mantive igual) ---
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP Segurança Eletrônica";
const brandCnpj = process.env.NEXT_PUBLIC_BRAND_CNPJ || "CNPJ: 35.550.155/0001-86";
const brandAddress = process.env.NEXT_PUBLIC_BRAND_ADDRESS || "Rua barros cassal, 35";
const brandCity = process.env.NEXT_PUBLIC_BRAND_CITY || "Jardim Bom Clima - Guarulhos, SP - 07196-270";
const brandIcon = process.env.NEXT_PUBLIC_BRAND_ICON || "/images/warpicon.png";
const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";

interface ServiceOrderPreviewProps {
    serviceOrderData: ServiceOrderData;
    onBack: () => void
}

export function ServiceOrderPreview({ serviceOrderData, onBack }: ServiceOrderPreviewProps) {
    // Variáveis simples
    const osNumber = serviceOrderData.osnumber || 'N/A'
    
    // Datas
    const created_at_date = new Date(serviceOrderData.created_at);
    const currentDate = !isNaN(created_at_date.getTime())
        ? created_at_date.toLocaleDateString("pt-BR")
        : "Data indisponível";
    const scheduledDateTime = serviceOrderData.scheduleddate && serviceOrderData.scheduleddate.length > 5
        ? new Date(serviceOrderData.scheduleddate.replace('T', ' ')).toLocaleString("pt-BR")
        : "Não agendado"

    if (!serviceOrderData || osNumber === 'N/A') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <p className="text-xl text-destructive mb-4">Ordem de Serviço não encontrada.</p>
                <Button onClick={onBack} className="bg-destructive hover:bg-destructive/90">Voltar</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* BARRA SUPERIOR (Ações) */}
            <div className="no-print sticky top-0 bg-background border-b p-4 flex justify-between items-center print:hidden z-10 shadow-sm">
                <Button variant="outline" onClick={onBack} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>

                {/* AQUI ESTÁ A MÁGICA: Uma linha resolve tudo */}
                <DocumentActions 
                    targetId="documento-visualizacao"
                    fileName={`WARP ${osNumber}`}
                    shareTitle={`OS ${osNumber}`}
                    shareText={`Olá! Segue o comprovante da Ordem de Serviço ${osNumber} - ${brandName}`}
                />
            </div>

            {/* DOCUMENTO A4 */}
            <div className="container mx-auto p-2 max-w-4xl print:p-0 print:max-w-none">
                <Card id="documento-visualizacao" className="print-page border-red-100 print:border-0 print:shadow-none bg-white">
                    <CardContent className="p-3 print:p-4">
                        <div className="print-header mb-3">
                            <div className="flex justify-between items-start mb-2">
                                {brandLogo && (
                                    <Image src={brandLogo} alt="Logo" width={708} height={256} quality={100} className="h-16 w-auto" unoptimized /> )} 
                                <div className="text-right">
                                    <div className="text-xl font-bold text-destructive mb-1 print:text-2xl">ORDEM DE SERVIÇO</div>
                                    <div className="text-xs space-y-0">
                                        <p><strong>Nº:</strong> {osNumber}</p>
                                        <p><strong>Data de Emissão:</strong> {currentDate}</p>
                                        {scheduledDateTime !== "Não agendado" && (<p><strong>Agendado para:</strong> {scheduledDateTime}</p>)}
                                    </div>
                                </div>
                            </div>
                            <Separator className="mb-4 print:mb-3" />
                            <div className="bg-destructive/10 p-3 rounded-lg mb-4 print:mb-3 print:p-2">
                                {/* print:grid-cols-2 garante o layout correto */}
                                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-2 text-xs print:text-xs">
                                    <div><p className="font-semibold text-destructive">{brandName}</p><p>{brandCnpj}</p></div>
                                    <div><p>{brandAddress}</p><p>{brandCity}</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <h2 className="text-base font-semibold mb-1 text-destructive border-b border-destructive/40 pb-0.5">DADOS DO CLIENTE</h2>
                            <div className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs space-y-0.5">
                                <p><strong>Nome/Razão Social:</strong> {serviceOrderData.cliente_nome}</p>
                                {serviceOrderData.cliente_documento && (<p><strong>CPF/CNPJ:</strong> {serviceOrderData.cliente_documento}</p>)}
                                {serviceOrderData.cliente_endereco && (<p><strong>Endereço:</strong> {serviceOrderData.cliente_endereco}</p>)}
                                <div className="flex gap-4">{serviceOrderData.cliente_telefone && (<span><strong>Tel:</strong> {serviceOrderData.cliente_telefone}</span>)}{serviceOrderData.cliente_email && (<span><strong>E-mail:</strong> {serviceOrderData.cliente_email}</span>)}</div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <h2 className="text-base font-semibold mb-1 text-destructive border-b border-destructive/40 pb-0.5">DETALHES DO SERVIÇO</h2>
                            <div className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs space-y-1">
                                <p><strong>Tipo de Serviço:</strong> {formatStructuredService(serviceOrderData.servicetype)}</p>
                                {serviceOrderData.description && (<div><p><strong>Descrição:</strong></p><p className="mt-0.5 text-xs leading-tight bg-white p-1.5 rounded border">{serviceOrderData.description}</p></div>)}
                                {serviceOrderData.observations && (<div><p><strong>Observações:</strong></p><p className="mt-0.5 text-xs leading-tight bg-white p-1.5 rounded border">{serviceOrderData.observations}</p></div>)}
                            </div>
                        </div>

                        <div className="mb-3">
                            <h2 className="text-base font-semibold mb-1 text-destructive border-b border-destructive/40 pb-0.5">EXECUÇÃO DO SERVIÇO</h2>
                            <div className="border border-destructive/40 rounded p-2 space-y-2">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div><p><strong>Técnico Responsável:</strong></p><div className="border-b border-gray-400 h-4 mt-1"></div></div>
                                    <div><p><strong>Data de Execução:</strong></p><div className="border-b border-gray-400 h-4 mt-1"></div></div>
                                </div>
                                <div>
                                    <p className="text-xs"><strong>Relatório de Execução:</strong></p>
                                    {serviceOrderData.relatorio_tecnico ? (
                                        <p className="mt-1 text-xs leading-tight bg-white p-1.5 rounded border whitespace-pre-wrap">{serviceOrderData.relatorio_tecnico}</p>
                                    ) : (
                                        <div className="space-y-1 mt-1"><div className="border-b border-gray-400 h-3"></div><div className="border-b border-gray-400 h-3"></div><div className="border-b border-gray-400 h-3"></div><div className="border-b border-gray-400 h-3"></div></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 print:space-y-2">
                            <div className="bg-destructive/10 border border-destructive/40 p-3 rounded print:p-2">
                                <p className="text-xs font-semibold text-destructive mb-1">IMPORTANTE:</p>
                                <p className="text-xs text-destructive">Esta Ordem de Serviço é válida somente mediante assinatura. Documentos não assinados não possuem validade comercial.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 print:gap-2">
                                <div className="border border-destructive/40 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ASSINATURA (TÉCNICO):</p><div className="h-12 print:h-8"></div><div className="border-t border-destructive/40 pt-1"><p className="text-xs text-center">{brandName}</p></div></div>
                                <div className="border border-destructive/40 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ASSINATURA DO CLIENTE:</p><div className="h-12 print:h-8"></div><div className="border-t border-destructive/40 pt-1"><p className="text-xs text-center">CLIENTE</p></div></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 items-center mt-8 print:mt-4">
                            <div></div>
                            <div className="flex justify-center">
                                {brandIcon && (<Image alt="Icon" width={375} height={463} quality={100} className="w-auto h-15 opacity-100 print:h-8 object-contain" src={brandIcon} unoptimized /> )}
                            </div>
                            <div className="flex justify-end"><p className="text-xs font-medium mb-2">DATA: ___ / ___ / ___</p></div>
                        </div>
                    </CardContent>
                    <div><DocumentFooter /> </div>
                </Card>
            </div>
        </div>
    )
}
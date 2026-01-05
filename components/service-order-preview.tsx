"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { formatStructuredService } from "@/lib/serviceUtils"
import { type ServiceOrderData } from "@/lib/types"
import { DocumentFooter } from "./DocumentFooter"
import { Separator } from "@/components/ui/separator"
import { DocumentActions } from "./share-image-button"

// --- Constantes ---
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
    const osNumber = serviceOrderData.osnumber || 'N/A'
    
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
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 print:p-0 print:bg-white print:block">
            
            {/* BARRA SUPERIOR */}
            <div className="no-print w-full max-w-[210mm] mb-4 flex justify-between items-center bg-white p-3 rounded shadow-sm border border-gray-200">
                <Button variant="outline" onClick={onBack} className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>

                <DocumentActions 
                    targetId="documento-visualizacao"
                    fileName={`WARP ${osNumber}`}
                    shareTitle={`OS ${osNumber}`}
                    shareText={`Olá! Segue o comprovante da Ordem de Serviço ${osNumber} - ${brandName}`}
                />
            </div>

            {/* DOCUMENTO A4 */}
            <div className="w-[210mm] print:w-full">
                <Card id="documento-visualizacao" className="bg-white text-gray-900 leading-snug shadow-lg print:shadow-none">
                    <CardContent className="p-8 print:p-0">
                        
                        {/* CABEÇALHO */}
                        <div className="mb-6 break-inside-avoid">
                            <div className="flex justify-between items-start mb-4">
                                {brandLogo && (
                                    <Image src={brandLogo} alt="Logo" width={708} height={256} quality={100} className="h-20 w-auto object-contain" unoptimized /> 
                                )} 
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-destructive mb-2 uppercase">ORDEM DE SERVIÇO</div>
                                    <div className="text-sm space-y-1 text-gray-700">
                                        <p><strong>Nº:</strong> {osNumber}</p>
                                        <p><strong>Emissão:</strong> {currentDate}</p>
                                        {scheduledDateTime !== "Não agendado" && (<p><strong>Agendado:</strong> {scheduledDateTime}</p>)}
                                    </div>
                                </div>
                            </div>
                            
                            <Separator className="mb-4 bg-gray-300" />
                            
                            <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><p className="font-bold text-destructive text-base">{brandName}</p><p>{brandCnpj}</p></div>
                                    <div className="text-right md:text-left"><p>{brandAddress}</p><p>{brandCity}</p></div>
                                </div>
                            </div>
                        </div>

                        {/* DADOS DO CLIENTE */}
                        <div className="mb-6 break-inside-avoid">
                            <h2 className="text-lg font-bold mb-2 text-destructive border-b-2 border-destructive/40 pb-1 uppercase">DADOS DO CLIENTE</h2>
                            <div className="bg-destructive/5 border border-gray-200 p-3 rounded text-sm space-y-1">
                                <p><strong className="text-gray-900">Nome/Razão Social:</strong> {serviceOrderData.cliente_nome}</p>
                                {serviceOrderData.cliente_documento && (<p><strong>CPF/CNPJ:</strong> {serviceOrderData.cliente_documento}</p>)}
                                {serviceOrderData.cliente_endereco && (<p><strong>Endereço:</strong> {serviceOrderData.cliente_endereco}</p>)}
                                <div className="flex gap-6 mt-1">{serviceOrderData.cliente_telefone && (<span><strong>Tel:</strong> {serviceOrderData.cliente_telefone}</span>)}{serviceOrderData.cliente_email && (<span><strong>E-mail:</strong> {serviceOrderData.cliente_email}</span>)}</div>
                            </div>
                        </div>

                        {/* DETALHES DO SERVIÇO */}
                        <div className="mb-6 break-inside-avoid">
                            <h2 className="text-lg font-bold mb-2 text-destructive border-b-2 border-destructive/40 pb-1 uppercase">DETALHES DO SERVIÇO</h2>
                            <div className="bg-destructive/5 border border-gray-200 p-3 rounded text-sm space-y-3">
                                <p><strong className="text-gray-900">Tipo de Serviço:</strong> {formatStructuredService(serviceOrderData.servicetype)}</p>
                                
                                {serviceOrderData.description && (
                                    <div>
                                        <p className="font-bold text-destructive mb-1">Descrição:</p>
                                        <div className="bg-white p-3 rounded border border-gray-300 text-justify whitespace-pre-wrap leading-relaxed text-gray-800">
                                            {serviceOrderData.description}
                                        </div>
                                    </div>
                                )}
                                
                                {serviceOrderData.observations && (
                                    <div>
                                        <p className="font-bold text-destructive mb-1">Observações:</p>
                                        <div className="bg-white p-3 rounded border border-gray-300 whitespace-pre-wrap leading-relaxed text-gray-800">
                                            {serviceOrderData.observations}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* EXECUÇÃO DO SERVIÇO */}
                        <div className="mb-6 break-inside-avoid">
                            <h2 className="text-lg font-bold mb-2 text-destructive border-b-2 border-destructive/40 pb-1 uppercase">EXECUÇÃO DO SERVIÇO</h2>
                            <div className="border border-destructive/40 rounded p-3 space-y-4">
                                <div className="grid grid-cols-2 gap-8 text-sm">
                                    <div>
                                        <p className="font-bold mb-1">Técnico Responsável:</p>
                                        <div className="border-b border-gray-400 h-6"></div>
                                    </div>
                                    <div>
                                        <p className="font-bold mb-1">Data de Execução:</p>
                                        <div className="border-b border-gray-400 h-6"></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-sm mb-1">Relatório de Execução:</p>
                                    <div className="text-sm leading-relaxed bg-white p-3 rounded border border-gray-300 whitespace-pre-wrap min-h-[80px]">
                                        {serviceOrderData.relatorio_tecnico || " "}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ASSINATURAS + ÍCONE + DATA */}
                        <div className="mt-auto break-inside-avoid">
                            <div className="bg-destructive/10 border border-destructive/40 p-3 rounded mb-4 text-center">
                                <p className="text-sm font-bold text-destructive">IMPORTANTE:</p>
                                <p className="text-xs text-destructive font-medium">Esta Ordem de Serviço é válida somente mediante assinatura. Documentos não assinados não possuem validade comercial.</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 mb-4">
                                <div className="border border-destructive/40 p-3 rounded h-24 relative">
                                    <p className="text-xs font-bold text-gray-500 absolute top-2 left-3 uppercase">Assinatura (Técnico)</p>
                                    <div className="absolute bottom-8 left-4 right-4 border-b border-gray-800"></div>
                                    <p className="text-xs font-bold text-center w-full absolute bottom-2 text-gray-700">{brandName}</p>
                                </div>
                                <div className="border border-destructive/40 p-3 rounded h-24 relative">
                                    <p className="text-xs font-bold text-gray-500 absolute top-2 left-3 uppercase">Assinatura do Cliente</p>
                                    <div className="absolute bottom-8 left-4 right-4 border-b border-gray-800"></div>
                                    <p className="text-xs font-bold text-center w-full absolute bottom-2 text-gray-700">CLIENTE</p>
                                </div>
                            </div>
                            
                            {/* ÍCONE W E DATA SEPARADOS */}
                            <div className="grid grid-cols-3 items-end mb-4">
                                <div className="col-span-1"></div>
                                <div className="col-span-1 flex justify-center">
                                    {brandIcon && (<Image alt="Icon" width={50} height={50} className="w-auto h-8 object-contain" src={brandIcon} unoptimized /> )}
                                </div>
                                <div className="col-span-1 text-right">
                                    <p className="text-xs font-bold text-gray-500">DATA: _____ / _____ / _______</p>
                                </div>
                            </div>

                            {/* RODAPÉ FULL WIDTH - AGORA FORA DO GRID */}
                            <div className="border-t border-gray-300 pt-4 w-full">
                                <DocumentFooter />
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
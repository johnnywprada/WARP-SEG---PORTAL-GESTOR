"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Image from "next/image"
import { formatStructuredService, type StructuredServiceData } from "@/lib/serviceUtils"

// MODELO DE DADOS PLANO FINAL - ATUALIZADO
export interface ServiceOrderData {
    cliente_nome: string
    cliente_endereco: string
    cliente_telefone: string
    cliente_email: string
    cliente_documento: string
    servicetype: StructuredServiceData
    description: string
    scheduleddate: string
    observations: string
    osnumber: string
    created_at: string
    status: "agendado" | "em-andamento" | "concluido" | "cancelado";
}

interface ServiceOrderPreviewProps {
    serviceOrderData: ServiceOrderData;
    onBack: () => void
}

export function ServiceOrderPreview({ serviceOrderData, onBack }: ServiceOrderPreviewProps) {
    // REMOVA O CONSOLE.LOG DAQUI QUANDO CONFIRMAR QUE FUNCIONOU
    console.log("DADOS QUE CHEGARAM NO PREVIEW:", serviceOrderData);

    const handlePrint = () => {
        window.print()
    }

    // --- VARIÁVEIS DE EXIBIÇÃO ---
    const osNumber = serviceOrderData.osnumber || 'N/A'
    const created_at_date = new Date(serviceOrderData.created_at);
    const currentDate = !isNaN(created_at_date.getTime())
        ? created_at_date.toLocaleDateString("pt-BR")
        : "Data indisponível";
    const scheduledDateTime = serviceOrderData.scheduleddate && serviceOrderData.scheduleddate.length > 5
        ? new Date(serviceOrderData.scheduleddate.replace('T', ' ')).toLocaleString("pt-BR")
        : "Não agendado"

    // --- Verificação de Falha de RLS ---
    if (!serviceOrderData || serviceOrderData.osnumber === 'N/A') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <p className="text-xl text-red-600 mb-4">Ordem de Serviço não encontrada ou acesso negado.</p>
                <Button onClick={onBack} className="bg-red-600 hover:bg-red-700">Voltar para a Lista</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="no-print sticky top-0 bg-background border-b p-4 flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={onBack} className="gap-2 bg-transparent border-red-200 text-red-600 hover:bg-red-50">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à Lista
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint} className="gap-2 bg-transparent border-red-200 text-red-600 hover:bg-red-50">
                        <Printer className="h-4 w-4" />
                        Imprimir OS
                    </Button>
                    <Button onClick={handlePrint} className="gap-2 bg-red-600 hover:bg-red-700">
                        <Download className="h-4 w-4" />
                        Salvar PDF
                    </Button>
                </div>
            </div>

            <div className="container mx-auto p-2 max-w-4xl print:p-0 print:max-w-none">
                <Card className="print-page border-red-100 print:border-0 print:shadow-none">
                    <CardContent className="p-3 print:p-4">
                        {/* SEU CABEÇALHO ORIGINAL - AGORA PRESERVADO */}
                        <div className="print-header mb-3">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Image src="/images/warp-logo.png" alt="WARP Segurança Eletrônica" width={140} height={42} className="h-8 w-auto print:h-10" />
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-red-600 mb-1 print:text-2xl">ORDEM DE SERVIÇO</div>
                                    <div className="text-xs space-y-0">
                                        <p><strong>Nº:</strong> {osNumber}</p>
                                        <p><strong>Data de Emissão:</strong> {currentDate}</p>
                                        {scheduledDateTime !== "Não agendado" && (<p><strong>Agendado para:</strong> {scheduledDateTime}</p>)}
                                    </div>
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

                        {/* SEUS DADOS DO CLIENTE - AGORA PRESERVADOS */}
                        <div className="mb-3">
                            <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">DADOS DO CLIENTE</h2>
                            <div className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs space-y-0.5">
                                <p><strong>Nome/Razão Social:</strong> {serviceOrderData.cliente_nome}</p>
                                {serviceOrderData.cliente_documento && (<p><strong>CPF/CNPJ:</strong> {serviceOrderData.cliente_documento}</p>)}
                                {serviceOrderData.cliente_endereco && (<p><strong>Endereço:</strong> {serviceOrderData.cliente_endereco}</p>)}
                                <div className="flex gap-4">
                                    {serviceOrderData.cliente_telefone && (<span><strong>Tel:</strong> {serviceOrderData.cliente_telefone}</span>)}
                                    {serviceOrderData.cliente_email && (<span><strong>E-mail:</strong> {serviceOrderData.cliente_email}</span>)}
                                </div>
                            </div>
                        </div>

                        {/* DETALHES DO SERVIÇO - COM A LÓGICA ATUALIZADA */}
                        <div className="mb-3">
                            <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">DETALHES DO SERVIÇO</h2>
                            <div className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs space-y-1">
                                <p><strong>Tipo de Serviço:</strong> {formatStructuredService(serviceOrderData.servicetype)}</p>
                                {serviceOrderData.description && (<div><p><strong>Descrição:</strong></p><p className="mt-0.5 text-xs leading-tight bg-white p-1.5 rounded border">{serviceOrderData.description}</p></div>)}
                                {serviceOrderData.observations && (<div><p><strong>Observações:</strong></p><p className="mt-0.5 text-xs leading-tight bg-white p-1.5 rounded border">{serviceOrderData.observations}</p></div>)}
                            </div>
                        </div>

                        {/* EXECUÇÃO DO SERVIÇO - PRESERVADO */}
                        <div className="mb-3">
                            <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">EXECUÇÃO DO SERVIÇO</h2>
                            <div className="border border-red-200 rounded p-2 space-y-2">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div><p><strong>Técnico Responsável:</strong></p><div className="border-b border-gray-400 h-4 mt-1"></div></div>
                                    <div><p><strong>Data de Execução:</strong></p><div className="border-b border-gray-400 h-4 mt-1"></div></div>
                                </div>
                                <div>
                                    <p className="text-xs"><strong>Relatório de Execução:</strong></p>
                                    <div className="space-y-1 mt-1">
                                        <div className="border-b border-gray-400 h-3"></div><div className="border-b border-gray-400 h-3"></div><div className="border-b border-gray-400 h-3"></div><div className="border-b border-gray-400 h-3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* NOSSO NOVO RODAPÉ PADRONIZADO */}
                        <div className="space-y-3 print:space-y-2">
                            <div className="bg-red-50 border border-red-200 p-3 rounded print:p-2">
                                <p className="text-xs font-semibold text-red-700 mb-1">IMPORTANTE:</p>
                                <p className="text-xs text-red-600">Esta Ordem de Serviço é válida somente mediante assinatura do cliente e da WARP SEGURANÇA ELETRÔNICA. Documentos não assinados não possuem validade comercial.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2">
                                <div className="border border-gray-300 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ASSINATURA (TÉCNICO RESPONSÁVEL):</p><div className="h-12 print:h-8"></div><div className="border-t border-gray-300 pt-1"><p className="text-xs text-center">WARP SEGURANÇA ELETRÔNICA</p></div></div>
                                <div className="border border-gray-300 p-3 rounded print:p-2"><p className="text-xs font-medium mb-2">ACEITE E ASSINATURA DO CLIENTE:</p><div className="h-12 print:h-8"></div><div className="border-t border-gray-300 pt-1"><p className="text-xs text-center">CLIENTE</p></div></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center mt-8 print:mt-4">
                            <div></div>
                            <div className="flex justify-center"><Image alt="Mascote WARP" width={60} height={60} className="h-12 w-auto opacity-50 print:h-8" src="/images/warp-mascot.png" /></div>
                            <div className="flex justify-end"><p className="text-sm font-medium text-gray-600 print:text-black">DATA: ______ / ______ / ______</p></div>
                        </div>

                    </CardContent>
                </Card>
            </div>

            <style jsx global>{`
                /* ... (seu CSS de impressão, inalterado) ... */
            `}</style>
        </div>
    )
}
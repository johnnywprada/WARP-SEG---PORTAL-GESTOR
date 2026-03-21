"use client"

import Image from "next/image"
import { formatStructuredService } from "@/lib/serviceUtils"
import { type ServiceOrderData } from "@/lib/types"
import { DocumentFooter } from "./DocumentFooter"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer, Save, AlertTriangle } from "lucide-react"

export function ServiceOrderPreview({
    serviceOrderData,
    onBack,
    onSave,
    isSaving
}: {
    serviceOrderData: ServiceOrderData;
    onBack?: () => void;
    onSave?: () => void;
    isSaving?: boolean;
}) {
    const osNumber = serviceOrderData.osnumber || 'N/A'
    const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";
    const brandIcon = process.env.NEXT_PUBLIC_BRAND_ICON || "/images/warpicon.png";
    const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP SEG";

    const formattedAgendamento = serviceOrderData.scheduleddate
        ? new Date(serviceOrderData.scheduleddate).toLocaleString("pt-BR", {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
        : 'A Definir';

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans w-full overflow-x-hidden print:overflow-x-visible print:bg-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>

            {/* FAIXA DE ALERTA DE RASCUNHO */}
            <div className="bg-amber-100 border-b border-amber-200 p-3 flex flex-col sm:flex-row items-center justify-center gap-2 print:hidden w-full z-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-800 uppercase text-center">Modo de Pré-visualização: Esta O.S ainda não foi salva.</span>
            </div>

            {/* BARRA DE CONTROLE (EDITAR OU SALVAR) */}
            <div className="sticky top-0 bg-white border-b shadow-sm z-40 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                {onBack && (
                    <Button variant="outline" onClick={onBack} className="gap-2 w-full sm:w-auto text-slate-700 hover:bg-slate-100 border-slate-300">
                        <ArrowLeft className="h-4 w-4" /> Voltar e Editar Dados
                    </Button>
                )}

                {/* <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button onClick={() => window.print()} variant="outline" className="gap-2 w-full sm:w-auto text-slate-700 hover:bg-slate-100 border-slate-300 shadow-sm">
                        <Printer className="h-4 w-4" /> Imprimir Rascunho
                    </Button> */}

                {onSave && (
                    <Button onClick={onSave} disabled={isSaving} className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto text-white shadow-sm">
                        <Save className="h-4 w-4" />
                        {isSaving ? "Salvando no Sistema..." : "Salvar Ordem de Serviço"}
                    </Button>
                )}
                {/* </div> */}
            </div>

            {/* VIEWPORT VIRTUAL: Área de scroll lateral no mobile */}
            <div className="flex-grow py-4 sm:py-8 w-full overflow-x-auto print:overflow-x-visible px-2 sm:px-0 pb-8">

                {/* A Tabela (Folha A4) */}
                <div className="w-full min-w-[650px] max-w-[210mm] mx-auto bg-white shadow-xl p-6 sm:p-12 print:p-0 print:shadow-none print:max-w-none print:w-full print:block box-border">
                    <table className="w-full border-collapse">
                        <thead className="table-header-group">
                            <tr>
                                <td className="pb-4 border-b-2" style={{ borderBottomColor: "#dc2626" }}>
                                    <div className="flex justify-between items-end pt-2 gap-4">
                                        <div className="flex justify-start">
                                            {brandLogo && <Image src={brandLogo} alt="Logo" width={400} height={150} className="h-12 w-auto object-contain print:h-12" priority />}
                                        </div>
                                        <div className="text-right">
                                            <h1 className="text-2xl font-bold uppercase" style={{ color: "#dc2626" }}>Ordem de Serviço</h1>
                                            <p className="font-bold text-base">Nº {osNumber}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td className="py-6">
                                    {/* DADOS DO CLIENTE - Mantidos em 2 colunas limpas */}
                                    <div className="grid grid-cols-2 gap-8 mb-6 border-b border-gray-100 pb-4 break-inside-avoid">
                                        <div>
                                            <h3 className="text-[10pt] font-bold uppercase mb-1" style={{ color: "#dc2626" }}>Cliente</h3>
                                            <p className="font-bold text-sm uppercase break-words">{serviceOrderData.cliente_nome}</p>
                                            <p className="text-xs text-gray-600 leading-tight mt-1">{serviceOrderData.cliente_endereco}</p>
                                        </div>
                                        <div className="text-right text-xs space-y-1">
                                            <p><strong>Emissão:</strong> {new Date().toLocaleDateString("pt-BR")}</p>
                                            <p><strong>Agendamento:</strong> {formattedAgendamento}</p>
                                            <p><strong>Tipo:</strong> {formatStructuredService(serviceOrderData.servicetype)}</p>
                                        </div>
                                    </div>

                                    {/* DESCRIÇÃO DO SERVIÇO */}
                                    <div className="mb-4 break-inside-avoid">
                                        <h3 className="text-[10pt] font-bold uppercase mb-1" style={{ color: "#dc2626" }}>Descrição do Serviço</h3>
                                        <div className="p-3 border rounded bg-slate-50/50 min-h-[4rem] text-[10pt] whitespace-pre-wrap break-words" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>
                                            {serviceOrderData.description || "Nenhuma descrição detalhada fornecida."}
                                        </div>
                                    </div>

                                    {/* OBSERVAÇÕES */}
                                    {serviceOrderData.observations && (
                                        <div className="mb-6 break-inside-avoid">
                                            <h3 className="text-[10pt] font-bold uppercase mb-1 text-gray-600">Observações Adicionais</h3>
                                            <div className="p-3 border border-gray-200 rounded text-[9pt] italic text-gray-700 whitespace-pre-wrap break-words">
                                                {serviceOrderData.observations}
                                            </div>
                                        </div>
                                    )}

                                    {/* RELATÓRIO DE EXECUÇÃO */}
                                    <div className="mb-8 break-inside-avoid">
                                        <h3 className="text-[10pt] font-bold uppercase mb-2" style={{ color: "#dc2626" }}>Relatório Técnico de Execução</h3>
                                        <div className="relative border rounded overflow-hidden" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>
                                            <div className="absolute inset-0 flex flex-col pointer-events-none print:flex">
                                                {Array.from({ length: 10 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-full border-b border-dotted"
                                                        style={{ height: "1.7rem", borderBottomColor: "rgba(220, 38, 38, 0.25)" }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="relative p-3 min-h-[17rem] leading-[1.7rem] text-[10pt] whitespace-pre-wrap z-10 break-words">
                                                {serviceOrderData.relatorio_tecnico || ""}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ASSINATURAS */}
                                    <div className="print:break-inside-avoid">
                                        <div className="grid grid-cols-2 gap-12 mt-8 mb-10">
                                            <div className="text-center w-full">
                                                <div className="border-b border-black h-12 mb-2"></div>
                                                <p className="text-[9pt] font-bold uppercase">Técnico ({brandName})</p>
                                            </div>
                                            <div className="text-center w-full">
                                                <div className="border-b border-black h-12 mb-2"></div>
                                                <p className="text-[9pt] font-bold uppercase break-words">Assinatura do Cliente</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end gap-4 px-4 py-4 border-t border-gray-100 print:py-2">
                                            <div className="w-1/3"></div>
                                            <div className="w-1/3 flex justify-center">
                                                {brandIcon && <Image src={brandIcon} alt="Icon" width={40} height={40} className="h-8 w-auto object-contain opacity-60" />}
                                            </div>
                                            <div className="w-1/3 text-right">
                                                <p className="text-[10pt] font-bold text-gray-500">
                                                    DATA: <span className="text-gray-300">_____ / _____ / _________</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>

                        {/* TFOOT: Rodapé */}
                        <tfoot className="table-footer-group">
                            <tr>
                                <td className="pt-4">
                                    <div className="mt-4 print:mt-2 w-full">
                                        <DocumentFooter />
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}
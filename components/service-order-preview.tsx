"use client"

import Image from "next/image"
import { formatStructuredService } from "@/lib/serviceUtils"
import { type ServiceOrderData } from "@/lib/types"
import { DocumentFooter } from "./DocumentFooter"

export function ServiceOrderPreview({ serviceOrderData }: { serviceOrderData: ServiceOrderData }) {
    const osNumber = serviceOrderData.osnumber || 'N/A'
    const brandLogo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/images/warp-logo.png";
    const brandIcon = process.env.NEXT_PUBLIC_BRAND_ICON || "/images/warpicon.png";
    const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "WARP SEG";

    return (
        <div className="w-full bg-white text-black font-sans print:text-[11pt]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <table className="w-full border-collapse">
                <thead className="table-header-group">
                    <tr>
                        <td className="pb-4 border-b-2" style={{ borderBottomColor: "#dc2626" }}>
                            <div className="flex justify-between items-center pt-2">
                                {brandLogo && <Image src={brandLogo} alt="Logo" width={400} height={150} className="h-12 w-auto object-contain" priority />}
                                <div className="text-right">
                                    <h1 className="text-2xl font-bold uppercase" style={{ color: "#dc2626" }}>Ordem de Serviço</h1>
                                    <p className="font-bold">Nº {osNumber}</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td className="py-6">
                            {/* DADOS DO CLIENTE */}
                            <div className="grid grid-cols-2 gap-8 mb-6 border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="text-[10pt] font-bold uppercase mb-1" style={{ color: "#dc2626" }}>Cliente</h3>
                                    <p className="font-bold text-sm uppercase">{serviceOrderData.cliente_nome}</p>
                                    <p className="text-xs text-gray-600 leading-tight">{serviceOrderData.cliente_endereco}</p>
                                </div>
                                <div className="text-right text-xs">
                                    <p><strong>Emissão:</strong> {new Date(serviceOrderData.created_at).toLocaleDateString("pt-BR")}</p>
                                    <p><strong>Tipo:</strong> {formatStructuredService(serviceOrderData.servicetype)}</p>
                                </div>
                            </div>

                            {/* CHECKLIST TÉCNICO */}
                            <div className="mb-6 break-inside-avoid">
                                <h3 className="text-[10pt] font-bold uppercase mb-2" style={{ color: "#dc2626" }}>Checklist de Verificação</h3>
                                <div className="grid grid-cols-2 gap-x-10 gap-y-1 text-[9pt] border p-3 rounded bg-slate-50/50" style={{ borderColor: "rgba(220, 38, 38, 0.1)" }}>
                                    <div className="flex items-center gap-2">□ Câmeras limpas e focadas</div>
                                    <div className="flex items-center gap-2">□ Sensores de presença testados</div>
                                    <div className="flex items-center gap-2">□ Nobreak e baterias verificados</div>
                                    <div className="flex items-center gap-2">□ Cabeamento e conectores OK</div>
                                    <div className="flex items-center gap-2">□ Gravação e acesso remoto OK</div>
                                    <div className="flex items-center gap-2">□ Local limpo e organizado</div>
                                </div>
                            </div>

                            {/* RELATÓRIO COM LINHAS PONTILHADAS VERMELHAS */}
                            <div className="mb-8">
                                <h3 className="text-[10pt] font-bold uppercase mb-2" style={{ color: "#dc2626" }}>Relatório Técnico de Execução</h3>
                                <div className="relative border rounded overflow-hidden" style={{ borderColor: "rgba(220, 38, 38, 0.2)" }}>
                                    {/* Camada de Linhas Físicas */}
                                    <div className="absolute inset-0 flex flex-col pointer-events-none">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div 
                                                key={i} 
                                                className="w-full border-b border-dotted" 
                                                style={{ height: "1.5rem", borderBottomColor: "rgba(220, 38, 38, 0.25)" }} 
                                            />
                                        ))}
                                    </div>
                                    {/* Camada de Texto */}
                                    <div className="relative p-2 min-h-[15rem] leading-[1.5rem] text-[11pt] whitespace-pre-wrap z-10">
                                        {serviceOrderData.relatorio_tecnico || ""}
                                    </div>
                                </div>
                            </div>

                            {/* ASSINATURAS E RODAPÉ INTERNO */}
                            <div className="print:break-inside-avoid">
                                <div className="grid grid-cols-2 gap-12 mt-4 mb-10">
                                    <div className="text-center">
                                        <div className="border-b border-black h-12 mb-2"></div>
                                        <p className="text-[9pt] font-bold uppercase">Técnico ({brandName})</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="border-b border-black h-12 mb-2"></div>
                                        <p className="text-[9pt] font-bold uppercase">Assinatura do Cliente</p>
                                    </div>
                                </div>

                                {/* ÍCONE W E DATA - CORRIGIDO PARA NÃO SUMIR */}
                                <div className="flex justify-between items-end px-4 py-2 border-t border-gray-100">
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

                <tfoot className="table-header-group">
                    <tr>
                        <td className="pt-4">
                            <DocumentFooter />
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}
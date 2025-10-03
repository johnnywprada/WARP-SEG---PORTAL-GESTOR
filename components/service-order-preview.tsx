"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Image from "next/image"

interface ClientData {
  name: string
  address: string
  phone: string
  email: string
  document: string
}

interface ServiceOrderData {
  client: ClientData
  serviceType: string
  description: string
  scheduledDate: string
  observations: string
}

interface ServiceOrderPreviewProps {
  serviceOrderData: ServiceOrderData
  onBack: () => void
}

const serviceTypeLabels: { [key: string]: string } = {
  "visita-tecnica": "Visita Técnica",
  "instalacao-cftv": "Instalação de CFTV",
  "instalacao-alarme": "Instalação de Alarme",
  "instalacao-controle-acesso": "Instalação de Controle de Acesso",
  "instalacao-automacao": "Instalação de Automação Residencial",
  "manutencao-preventiva": "Manutenção Preventiva",
  "manutencao-corretiva": "Manutenção Corretiva",
}

export function ServiceOrderPreview({ serviceOrderData, onBack }: ServiceOrderPreviewProps) {
  const handlePrint = () => {
    window.print()
  }

  const osNumber = `OS-${Date.now().toString().slice(-6)}`
  const currentDate = new Date().toLocaleDateString("pt-BR")
  const scheduledDateTime = serviceOrderData.scheduledDate
    ? new Date(serviceOrderData.scheduledDate).toLocaleString("pt-BR")
    : ""

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print sticky top-0 bg-background border-b p-4 flex justify-between items-center print:hidden">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 bg-transparent border-red-200 text-red-600 hover:bg-red-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Formulário
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2 bg-transparent border-red-200 text-red-600 hover:bg-red-50"
          >
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
            <div className="print-header mb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/warp-logo.png"
                    alt="WARP Segurança Eletrônica"
                    width={140}
                    height={42}
                    className="h-8 w-auto print:h-10"
                  />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-600 mb-1 print:text-2xl">ORDEM DE SERVIÇO</div>
                  <div className="text-xs space-y-0">
                    <p>
                      <strong>Nº:</strong> {osNumber}
                    </p>
                    <p>
                      <strong>Data de Emissão:</strong> {currentDate}
                    </p>
                    {scheduledDateTime && (
                      <p>
                        <strong>Agendado para:</strong> {scheduledDateTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded p-1.5 mb-2">
                <div className="text-xs text-gray-700 flex flex-wrap gap-x-3 gap-y-0">
                  <span>
                    <strong>CNPJ:</strong> 35.550.155/0001-86
                  </span>
                  <span>
                    <strong>End.:</strong> Rua Pedro Fernandes Biscaino, 226 - Jardim Diogo
                  </span>
                  <span>
                    <strong>Cidade:</strong> Guarulhos, SP - CEP: 01735-030
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">
                DADOS DO CLIENTE
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs space-y-0.5">
                <p>
                  <strong>Nome/Razão Social:</strong> {serviceOrderData.client.name}
                </p>
                {serviceOrderData.client.document && (
                  <p>
                    <strong>CPF/CNPJ:</strong> {serviceOrderData.client.document}
                  </p>
                )}
                {serviceOrderData.client.address && (
                  <p>
                    <strong>Endereço:</strong> {serviceOrderData.client.address}
                  </p>
                )}
                <div className="flex gap-4">
                  {serviceOrderData.client.phone && (
                    <span>
                      <strong>Tel:</strong> {serviceOrderData.client.phone}
                    </span>
                  )}
                  {serviceOrderData.client.email && (
                    <span>
                      <strong>E-mail:</strong> {serviceOrderData.client.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">
                DETALHES DO SERVIÇO
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-1.5 rounded text-xs space-y-1">
                <p>
                  <strong>Tipo de Serviço:</strong>{" "}
                  {serviceTypeLabels[serviceOrderData.serviceType] || serviceOrderData.serviceType}
                </p>
                {serviceOrderData.description && (
                  <div>
                    <p>
                      <strong>Descrição:</strong>
                    </p>
                    <p className="mt-0.5 text-xs leading-tight bg-white p-1.5 rounded border">
                      {serviceOrderData.description}
                    </p>
                  </div>
                )}
                {serviceOrderData.observations && (
                  <div>
                    <p>
                      <strong>Observações:</strong>
                    </p>
                    <p className="mt-0.5 text-xs leading-tight bg-white p-1.5 rounded border">
                      {serviceOrderData.observations}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <h2 className="text-base font-semibold mb-1 text-red-600 border-b border-red-200 pb-0.5">
                EXECUÇÃO DO SERVIÇO
              </h2>
              <div className="border border-red-200 rounded p-2 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p>
                      <strong>Técnico Responsável:</strong>
                    </p>
                    <div className="border-b border-gray-400 h-4 mt-1"></div>
                  </div>
                  <div>
                    <p>
                      <strong>Data de Execução:</strong>
                    </p>
                    <div className="border-b border-gray-400 h-4 mt-1"></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs">
                    <strong>Relatório de Execução:</strong>
                  </p>
                  <div className="space-y-1 mt-1">
                    <div className="border-b border-gray-400 h-3"></div>
                    <div className="border-b border-gray-400 h-3"></div>
                    <div className="border-b border-gray-400 h-3"></div>
                    <div className="border-b border-gray-400 h-3"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-2 bg-red-50 border-2 border-red-300 rounded p-2">
              <div className="flex items-start gap-2">
                <div className="bg-red-600 text-white rounded-full p-0.5 mt-0.5">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-xs">
                  <p className="font-bold text-red-800 mb-0.5">IMPORTANTE - VALIDADE DA ORDEM DE SERVIÇO:</p>
                  <p className="text-red-700 leading-tight">
                    <strong>
                      Esta ordem de serviço somente será válida mediante assinatura e carimbo oficial da WARP SEGURANÇA
                      ELETRÔNICA.
                    </strong>
                    Ordens de serviço não assinadas ou emitidas por terceiros não autorizados não possuem validade.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-red-200 pt-2">
              <div className="flex items-end justify-between">
                <div className="text-xs text-gray-600 flex-1">
                  <div className="grid grid-cols-2 gap-8 mt-4">
                    <div className="text-center">
                      <div className="w-48 h-8 border-b border-gray-400 mb-1"></div>
                      <div className="w-48 border-b border-gray-400 mb-1"></div>
                      <p className="text-xs text-gray-500">Assinatura e Carimbo WARP SEG</p>
                    </div>
                    <div className="text-center">
                      <div className="w-48 h-8 border-b border-gray-400 mb-1"></div>
                      <div className="w-48 border-b border-gray-400 mb-1"></div>
                      <p className="text-xs text-gray-500">Assinatura do Cliente</p>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <div className="w-24 border-b border-gray-400 mb-1 mx-auto"></div>
                    <p className="text-xs text-gray-500">Data: ___/___/___</p>
                  </div>
                </div>
                <Image
                  src="/images/warp-mascot.png"
                  alt="Mascote WARP"
                  width={32}
                  height={32}
                  className="h-6 w-auto opacity-80 ml-3"
                />
              </div>
              <div className="text-center text-red-600 font-semibold text-xs mt-1">
                WARP SEGURANÇA ELETRÔNICA - Protegendo o que é importante para você
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          /* Removendo todos os elementos desnecessários da impressão */
          .no-print, 
          .print\\:hidden,
          nav,
          header,
          footer,
          .sticky,
          button,
          .cursor-pointer {
            display: none !important;
          }
          
          /* Resetando completamente o layout para impressão limpa */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            font-size: 12px !important;
            line-height: 1.3 !important;
            background: white !important;
            color: black !important;
          }
          
          /* Garantindo que apenas o conteúdo do documento apareça */
          .print-page {
            page-break-inside: avoid;
            margin: 0 !important;
            padding: 8mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            width: 100% !important;
            max-width: none !important;
          }
          
          @page {
            margin: 8mm !important;
            size: A4 !important;
          }
          
          /* Removendo qualquer container ou wrapper desnecessário */
          .container {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          
          .min-h-screen {
            min-height: auto !important;
            height: auto !important;
          }
          
          /* Garantindo que cores e bordas apareçam na impressão */
          .bg-red-600,
          .text-red-600,
          .border-red-200,
          .border-red-100 {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}

// lib/serviceUtils.ts

// Usamos `as const` para criar tipos mais fortes e específicos
export const acaoLabels = {
  "instalacao": "Instalação",
  "manutencao": "Manutenção",
  "visita-tecnica": "Visita Técnica"
} as const;

export const sistemaLabels = {
  "cftv": "CFTV",
  "alarme": "Alarme",
  "controle-acesso": "Controle de Acesso",
  "automacao-residencial": "Automação Residencial"
} as const;

export const tipoManutencaoLabels = {
  "preventiva": "Preventiva",
  "corretiva": "Corretiva"
} as const;

// Criamos tipos específicos a partir das chaves dos objetos acima
export type AcaoValue = keyof typeof acaoLabels;
export type SistemaValue = keyof typeof sistemaLabels;
export type TipoManutencaoValue = keyof typeof tipoManutencaoLabels;

// Exportamos a interface para que os componentes saibam a "forma" desse objeto
export interface StructuredServiceData {
  acao: AcaoValue | undefined;
  sistemas?: SistemaValue[];
  tipo_manutencao?: TipoManutencaoValue | undefined;
}

/**
 * Constrói uma string de serviço a partir de um objeto estruturado ou de uma string antiga.
 */
export const formatStructuredService = (serviceData: StructuredServiceData | string | null | undefined): string => {
  // 1. Lida com o formato antigo (string) ou com valores nulos/undefined primeiro
  if (typeof serviceData === 'string') {
      const oldLabels: { [key: string]: string } = { "visita-tecnica": "Visita Técnica", "instalacao-cftv": "Instalação de CFTV", "instalacao-alarme": "Instalação de Alarme", "instalacao-controle-acesso": "Instalação de Controle de Acesso", "instalacao-automacao": "Instalação de Automação Residencial", "manutencao-preventiva": "Manutenção Preventiva", "manutencao-corretiva": "Manutenção Corretiva" };
      return oldLabels[serviceData] || serviceData;
  }

  // 2. Lida com objetos inválidos ou nulos
  if (!serviceData || typeof serviceData !== 'object' || !serviceData.acao) {
    return "Serviço não especificado";
  }
  
  // 3. Daqui para baixo, o TypeScript sabe que 'serviceData' é um objeto válido
  const { acao, sistemas, tipo_manutencao } = serviceData;
  
  let acaoPrincipal = acaoLabels[acao];

  if (acao === 'manutencao' && tipo_manutencao) {
    acaoPrincipal += ` ${tipoManutencaoLabels[tipo_manutencao]}`;
  }
  
  if (!sistemas || sistemas.length === 0) {
    return acaoPrincipal;
  }
  
  const nomesSistemas = sistemas.map((key: SistemaValue) => sistemaLabels[key] || key).join(" + ");
  
  return `${acaoPrincipal} de ${nomesSistemas}`;
};
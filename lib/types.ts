// Usaremos este arquivo como a "fonte única da verdade" para nossas interfaces.

import { type StructuredServiceData } from "./serviceUtils"; // Importamos o tipo estruturado


export interface SavedClient {
  id: string;
  nome: string;
  documento: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  observacoes: string | null;
  dados_equipamentos: any[] | null;
  created_at: string;
}

export interface SavedBudget {
  id: string;
  budgetNumber: string;
  client: { name: string; address: string; phone: string; email: string; };
  products: Array<any>;
  paymentMethod: string;
  observations: string;
  validUntil: string;
  totalValue: number;
  status: "em-aberto" | "instalando" | "concluido" | "cancelado";
  created_at: string;
}

export interface SavedServiceOrder {
  id: string;
  osnumber: string;
  cliente_nome: string;
  cliente_endereco: string;
  cliente_telefone: string;
  cliente_email: string;
  cliente_documento: string;
  servicetype: any; // Mantemos 'any' por enquanto para flexibilidade
  description: string;
  scheduleddate: string;
  observations: string;
  status: "agendado" | "em-andamento" | "concluido" | "cancelado";
  created_at: string;
  user_id: string;
  relatorio_tecnico: string | null; // <-- ADICIONE ESTA LINHA
}
  export interface ServiceOrderData {
    cliente_nome: string
    cliente_endereco: string | null
    cliente_telefone: string | null
    cliente_email: string | null
    cliente_documento: string | null
    servicetype: StructuredServiceData
    description: string | null
    scheduleddate: string
    observations: string | null
    osnumber: string
    created_at: string
    status: "agendado" | "em-andamento" | "concluido" | "cancelado";
    relatorio_tecnico: string | null;
}
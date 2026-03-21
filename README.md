# Portal Warp SEG - Sistemas Inteligentes 🛡️

O **Portal Warp SEG** é uma solução completa de gestão operacional e financeira desenvolvida sob medida para empresas de segurança eletrônica. O sistema centraliza o controle de clientes, equipamentos, cotações de materiais, orçamentos e ordens de serviço técnico.

## 🚀 Principais Funcionalidades

### 1. Gestão de Clientes e Equipamentos 💾
- [cite_start]Cadastro detalhado de clientes com histórico de endereços e contatos[cite: 11].
- [cite_start]**Mapeamento Técnico**: Registro de DVRs, NVRs, Centrais de Alarme e Câmeras IP, incluindo armazenamento seguro de senhas, IPs e zoneamentos[cite: 11, 12].

### 2. Sistema de Cotação Inteligente 🧮
- Cálculo de custos de materiais por fornecedor.
- Definição de margens de lucro individuais ou globais.
- [cite_start]Conversão direta de cotação aprovada para Orçamento de Venda[cite: 8, 9].

### 3. Orçamentos Profissionais 📄
- Geração de orçamentos em PDF com layout limpo e otimizado.
- [cite_start]Controle de validade e métodos de pagamento[cite: 3].
- [cite_start]Compartilhamento rápido via link direto ou WhatsApp[cite: 5].

### 4. Ordens de Serviço (O.S) 🔧
- [cite_start]Gerenciamento completo de instalações e manutenções (Preventivas/Corretivas)[cite: 13].
- Relatório técnico de execução com layout de papel timbrado.
- [cite_start]Sistema de rascunho para revisão antes da emissão final[cite: 14].

## 📱 Experiência Mobile-First

O sistema foi totalmente refatorado para uso em campo:
- [cite_start]**Thumb Zone Design**: Botões e inputs otimizados para operação com o polegar[cite: 1, 2, 7, 10].
- [cite_start]**Viewport Virtual**: Visualização de documentos A4 no celular através de scroll lateral suave, garantindo que o técnico veja o documento exatamente como o cliente o receberá[cite: 4, 15].

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [Next.js](https://nextjs.org/) (React)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes**: [Shadcn/UI](https://ui.shadcn.com/)
- **Banco de Dados & Auth**: [Supabase](https://supabase.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)

## 📋 Pré-requisitos

Antes de começar, você precisará de:
1. Uma conta no **Supabase** para o banco de dados.
2. Variáveis de ambiente configuradas no seu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BRAND_LOGO_URL`

## ⚙️ Instalação

```bash
# Clone o repositório
git clone [https://github.com/seu-usuario/warp-budget-system.git](https://github.com/seu-usuario/warp-budget-system.git)

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

---
Desenvolvido por **Warp Sistemas Inteligentes**
```
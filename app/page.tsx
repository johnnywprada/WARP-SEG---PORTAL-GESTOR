"use client"

import { useState, useEffect } from "react"
import { BudgetGenerator } from "@/components/budget-generator"
import { BudgetList } from "@/components/budget-list"
import { SavedBudgetPreview } from "@/components/saved-budget-preview"
import { ServiceOrderGenerator } from "@/components/service-order-generator"
import { ServiceOrderList } from "@/components/service-order-list"
import { ServiceOrderPreview } from "@/components/service-order-preview"
import { DataExport } from "@/components/data-export"
import { LoginForm } from "@/components/login-form"
import { ChangePassword } from "@/components/change-password"
import { ClientList } from "@/components/client-list"
import { ClientForm } from "@/components/client-form"
import { ClientDetail } from "@/components/client-detail"
import { Button } from "@/components/ui/button"
import { LogOut, List, FileText, Wrench, Download, KeyRound, User } from "lucide-react"
import { supabase } from '@/lib/supabase/client'
import { type SavedBudget, type SavedServiceOrder, type SavedClient } from "@/lib/types"

type ViewMode =
  | "menu" | "budget-generator" | "budget-list" | "budget-preview" | "os-generator" | "os-list" | "os-preview" | "data-export" | "change-password"
  | "client-list" | "client-form" | "client-detail";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewMode>("menu")
  const [selectedBudget, setSelectedBudget] = useState<SavedBudget | null>(null)
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<SavedServiceOrder | null>(null)
  const [selectedClient, setSelectedClient] = useState<SavedClient | null>(null)

  useEffect(() => { async function checkAuth() { const { data } = await supabase.auth.getSession(); setIsAuthenticated(!!data.session); setIsLoading(false); } checkAuth(); }, [])

  const handleLogin = () => { setIsAuthenticated(true) }
  const handleLogout = async () => { await supabase.auth.signOut(); setIsAuthenticated(false); setCurrentView("menu"); setSelectedBudget(null); setSelectedServiceOrder(null); setSelectedClient(null); }

  const handleViewBudgetGenerator = () => { setCurrentView("budget-generator") }
  const handleViewBudgetList = () => { setCurrentView("budget-list") }
  const handleViewBudget = (budget: SavedBudget) => { setSelectedBudget(budget); setCurrentView("budget-preview") }
  const handleBackToBudgetList = () => { setCurrentView("budget-list"); setSelectedBudget(null) }
  const handleViewOSGenerator = () => { setCurrentView("os-generator") }
  const handleViewOSList = () => { setCurrentView("os-list") }
  const handleViewServiceOrder = (serviceOrder: SavedServiceOrder) => { setSelectedServiceOrder(serviceOrder); setCurrentView("os-preview") }
  const handleBackToOSList = () => { setCurrentView("os-list"); setSelectedServiceOrder(null) }
  const handleBackToMenu = () => { setCurrentView("menu"); setSelectedBudget(null); setSelectedServiceOrder(null); setSelectedClient(null); }
  const handleViewDataExport = () => { setCurrentView("data-export") }
  const handleViewChangePassword = () => { setCurrentView("change-password") }
  const handleViewClientList = () => { setCurrentView("client-list") }
  const handleViewClientForm = () => { setSelectedClient(null); setCurrentView("client-form"); }
  const handleViewClient = (client: SavedClient) => { setSelectedClient(client); setCurrentView("client-detail") }
  const handleBackToClientList = () => { setCurrentView("client-list"); setSelectedClient(null) }
  const handleViewClientEdit = () => { if (selectedClient) { setCurrentView("client-form"); } };

  if (isLoading) { return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div><p className="mt-2 text-slate-600">Carregando...</p></div></div> }
  if (!isAuthenticated) { return <LoginForm onLogin={handleLogin} /> }

  if (currentView === "budget-generator") { return <BudgetGenerator onBackToMenu={handleBackToMenu} onViewBudgetList={handleViewBudgetList} onLogout={handleLogout} /> }
  if (currentView === "budget-list") { return <BudgetList onBack={handleBackToMenu} onViewBudget={handleViewBudget} /> }
  if (currentView === "budget-preview" && selectedBudget) { return <SavedBudgetPreview budget={selectedBudget} onBack={handleBackToBudgetList} /> }
  if (currentView === "os-generator") { return <ServiceOrderGenerator onBackToMenu={handleBackToMenu} onViewOSList={handleViewOSList} onLogout={handleLogout} /> }
  if (currentView === "os-list") { return <ServiceOrderList onBack={handleBackToMenu} onViewServiceOrder={handleViewServiceOrder} /> }
  if (currentView === "os-preview" && selectedServiceOrder) { return <ServiceOrderPreview serviceOrderData={selectedServiceOrder as any} onBack={handleBackToOSList} /> }
  if (currentView === "data-export") { return <DataExport onBackToMenu={handleBackToMenu} onLogout={handleLogout} /> }
  if (currentView === "change-password") { return <ChangePassword onBack={handleBackToMenu} /> }
  if (currentView === "client-list") { return <ClientList onBack={handleBackToMenu} onViewClient={handleViewClient} onAddClient={handleViewClientForm} /> }
  
  if (currentView === "client-form") { 
    return <ClientForm 
      onBack={selectedClient ? () => handleViewClient(selectedClient) : handleBackToClientList} 
      clientToEdit={selectedClient}
      onBackToMenu={handleBackToMenu}
      onViewList={handleViewClientList}
      onLogout={handleLogout}
    /> 
  }
  
  if (currentView === "client-detail" && selectedClient) { return <ClientDetail client={selectedClient} onBack={handleBackToClientList} onEdit={handleViewClientEdit} /> }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold text-slate-800">Sistema de Gestão - WARP Segurança Eletrônica</h1>
          <div className="flex items-center gap-3">
            <Button onClick={handleViewChangePassword} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"><KeyRound className="h-4 w-4 mr-2" /> Alterar Senha</Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"><LogOut className="h-4 w-4 mr-2" /> Sair</Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Sistema de Gestão Empresarial</h2>
          <p className="text-muted-foreground">Escolha o módulo que deseja utilizar</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-red-100 rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center"><FileText className="h-8 w-8 text-red-600" /></div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">Orçamentos</h3>
              <p className="text-sm text-muted-foreground">Gere e gerencie orçamentos para seus clientes</p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleViewBudgetGenerator} className="w-full bg-red-600 hover:bg-red-700">Criar Novo Orçamento</Button>
              <Button onClick={handleViewBudgetList} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"><List className="h-4 w-4 mr-2" /> Gerenciar Orçamentos</Button>
            </div>
          </div>
          <div className="bg-white border border-red-100 rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center"><Wrench className="h-8 w-8 text-red-600" /></div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">Ordens de Serviço</h3>
              <p className="text-sm text-muted-foreground">Crie e controle ordens de serviço técnico</p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleViewOSGenerator} className="w-full bg-red-600 hover:bg-red-700">Criar Nova OS</Button>
              <Button onClick={handleViewOSList} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"><List className="h-4 w-4 mr-2" /> Gerenciar Ordens de Serviço</Button>
            </div>
          </div>
          <div className="bg-white border border-red-100 rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center"><User className="h-8 w-8 text-red-600" /></div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">Clientes</h3>
              <p className="text-sm text-muted-foreground">Cadastre e gerencie seus clientes e equipamentos</p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleViewClientForm} className="w-full bg-red-600 hover:bg-red-700">Cadastrar Novo Cliente</Button>
              <Button onClick={handleViewClientList} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"><List className="h-4 w-4 mr-2" /> Gerenciar Clientes</Button>
            </div>
          </div>
          <div className="bg-white border border-red-100 rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center"><Download className="h-8 w-8 text-red-600" /></div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">Exportação</h3>
              <p className="text-sm text-muted-foreground">Exporte todos os dados do sistema</p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleViewDataExport} className="w-full bg-red-600 hover:bg-red-700"><Download className="h-4 w-4 mr-2" />Exportar Dados</Button>
            </div>
          </div>
          <div className="bg-white border border-red-100 rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center"><KeyRound className="h-8 w-8 text-red-600" /></div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">Configurações</h3>
              <p className="text-sm text-muted-foreground">Gerencie configurações do sistema</p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleViewChangePassword} className="w-full bg-red-600 hover:bg-red-700"><KeyRound className="h-4 w-4 mr-2" />Alterar Senha</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
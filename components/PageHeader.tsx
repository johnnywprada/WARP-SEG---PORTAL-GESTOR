// components/PageHeader.tsx

"use client"

import { Button } from "@/components/ui/button"
import { LogOut, List, ArrowLeft } from "lucide-react"

interface PageHeaderProps {
  title: string;
  onBackToMenu: () => void;
  onLogout: () => void;
  onViewList?: () => void; // Prop opcional
  viewListText?: string;   // Prop opcional
}

export function PageHeader({ title, onBackToMenu, onLogout, onViewList, viewListText }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-4 sm:py-3">
      {/* Container principal: Empilha tudo no celular, lado a lado em telas maiores */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        
        {/* Título */}
        <h1 className="text-lg sm:text-xl font-semibold text-slate-800 text-center sm:text-left w-full sm:w-auto leading-tight">
          {title}
        </h1>
        
        {/* Container de Botões: Empilhados (w-full) no celular, em linha no desktop */}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
          <Button 
            onClick={onBackToMenu} 
            variant="outline" 
            size="sm" 
            className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao Menu
          </Button>

          {onViewList && viewListText && (
            <Button 
              onClick={onViewList} 
              variant="outline" 
              size="sm" 
              className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10 bg-transparent w-full sm:w-auto"
            >
              <List className="h-4 w-4" />
              {viewListText}
            </Button>
          )}

          <Button 
            onClick={onLogout} 
            variant="outline" 
            size="sm" 
            className="gap-2 text-destructive border-destructive/40 hover:bg-destructive/10 bg-transparent w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
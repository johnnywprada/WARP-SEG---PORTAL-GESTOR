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
    <div className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        <div className="flex items-center gap-3">
          <Button onClick={onBackToMenu} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Menu
          </Button>
          {onViewList && viewListText && (
            <Button onClick={onViewList} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
              <List className="h-4 w-4 mr-2" />
              {viewListText}
            </Button>
          )}
          <Button onClick={onLogout} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
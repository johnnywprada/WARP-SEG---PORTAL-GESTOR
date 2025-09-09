"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, FileText, Printer, Save, ArrowLeft } from "lucide-react"
import { BudgetPreview } from "./budget-preview"
import Image from "next/image"

interface HistoryEntry {
  timestamp: string
  action: string
  details: string
  user: string
}

interface Product {
  id: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

interface ClientData {
  name: string
  address: string
  phone: string
  email: string
}

interface SavedBudget {
  id: string
  budgetNumber: string
  client: ClientData
  products: Product[]
  paymentMethod: string
  observations: string
  validUntil: string
  totalValue: number
  status: "em-aberto" | "instalando" | "concluido" | "cancelado"
  createdAt: string
  history?: HistoryEntry[]
}

interface BudgetData {
  client: ClientData
  products: Product[]
  paymentMethod: string
  observations: string
  validUntil: string
}

interface BudgetGeneratorProps {
  editingBudget?: SavedBudget
  onBack?: () => void
}

export function BudgetGenerator({ editingBudget, onBack }: BudgetGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [budgetData, setBudgetData] = useState<BudgetData>({
    client: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
    products: [
      {
        id: "1",
        description: "",
        quantity: 1,
        unit: "UN",
        unitPrice: 0,
        total: 0,
      },
    ],
    paymentMethod: "",
    observations: "",
    validUntil: "",
  })

  useEffect(() => {
    if (editingBudget) {
      setBudgetData({
        client: editingBudget.client,
        products: editingBudget.products,
        paymentMethod: editingBudget.paymentMethod,
        observations: editingBudget.observations,
        validUntil: editingBudget.validUntil,
      })
    }
  }, [editingBudget])

  const saveBudget = () => {
    if (!budgetData.client.name.trim()) {
      alert("Por favor, preencha o nome do cliente antes de salvar.")
      return
    }

    const existingBudgets = JSON.parse(localStorage.getItem("warp-budgets") || "[]")

    if (editingBudget) {
      const historyEntry: HistoryEntry = {
        timestamp: new Date().toISOString(),
        action: "Orçamento editado",
        details: "Dados do orçamento foram atualizados",
        user: "Sistema",
      }

      const updatedBudget: SavedBudget = {
        ...editingBudget,
        ...budgetData,
        totalValue: getTotalBudget(),
        history: [...(editingBudget.history || []), historyEntry],
      }

      const updatedBudgets = existingBudgets.map((budget: SavedBudget) =>
        budget.id === editingBudget.id ? updatedBudget : budget,
      )
      localStorage.setItem("warp-budgets", JSON.stringify(updatedBudgets))
      alert(`Orçamento ${editingBudget.budgetNumber} atualizado com sucesso!`)

      if (onBack) onBack()
    } else {
      const budgetNumber = `WARP-${Date.now().toString().slice(-6)}`
      const historyEntry: HistoryEntry = {
        timestamp: new Date().toISOString(),
        action: "Orçamento criado",
        details: "Orçamento criado no sistema",
        user: "Sistema",
      }

      const savedBudget: SavedBudget = {
        id: Date.now().toString(),
        budgetNumber,
        ...budgetData,
        totalValue: getTotalBudget(),
        status: "em-aberto",
        createdAt: new Date().toISOString(),
        history: [historyEntry],
      }

      const updatedBudgets = [...existingBudgets, savedBudget]
      localStorage.setItem("warp-budgets", JSON.stringify(updatedBudgets))
      alert(`Orçamento ${budgetNumber} salvo com sucesso!`)
    }
  }

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unit: "UN",
      unitPrice: 0,
      total: 0,
    }
    setBudgetData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }))
  }

  const removeProduct = (id: string) => {
    setBudgetData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }))
  }

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setBudgetData((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice
          }
          return updated
        }
        return p
      }),
    }))
  }

  const updateClient = (field: keyof ClientData, value: string) => {
    setBudgetData((prev) => ({
      ...prev,
      client: { ...prev.client, [field]: value },
    }))
  }

  const getTotalBudget = () => {
    return budgetData.products.reduce((sum, product) => sum + product.total, 0)
  }

  if (showPreview) {
    return <BudgetPreview budgetData={budgetData} onBack={() => setShowPreview(false)} editingBudget={editingBudget} />
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        {editingBudget && onBack && (
          <div className="flex justify-start mb-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar à Lista
            </Button>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 mb-4">
          <Image
            src="/images/warp-logo.png"
            alt="WARP Segurança Eletrônica"
            width={300}
            height={80}
            className="h-16 w-auto"
          />
          <Image src="/images/warp-mascot.png" alt="Mascote WARP" width={80} height={80} className="h-16 w-auto" />
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">
          {editingBudget ? `Editando ${editingBudget.budgetNumber}` : "Sistema de Orçamentos"}
        </h1>
        <p className="text-muted-foreground">
          {editingBudget ? "Edição de orçamento existente" : "Geração de orçamentos padronizados"}
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-red-100">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <FileText className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  value={budgetData.client.name}
                  onChange={(e) => updateClient("name", e.target.value)}
                  placeholder="Nome completo ou razão social"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">E-mail</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={budgetData.client.email}
                  onChange={(e) => updateClient("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone">Telefone/Contato</Label>
                <Input
                  id="clientPhone"
                  value={budgetData.client.phone}
                  onChange={(e) => updateClient("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Válido até</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={budgetData.validUntil}
                  onChange={(e) => setBudgetData((prev) => ({ ...prev, validUntil: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="clientAddress">Endereço Completo</Label>
              <Textarea
                id="clientAddress"
                value={budgetData.client.address}
                onChange={(e) => updateClient("address", e.target.value)}
                placeholder="Rua, número, bairro, cidade, CEP"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center justify-between text-red-700">
              <span>Produtos/Serviços</span>
              <Button onClick={addProduct} size="sm" className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetData.products.map((product, index) => (
                <div key={product.id} className="border border-red-100 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-600">Item {index + 1}</span>
                    {budgetData.products.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                        className="text-destructive hover:text-destructive border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                      <Label>Descrição do Produto/Serviço *</Label>
                      <Input
                        value={product.description}
                        onChange={(e) => updateProduct(product.id, "description", e.target.value)}
                        placeholder="Ex: Câmera de segurança IP..."
                      />
                    </div>
                    <div>
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => updateProduct(product.id, "quantity", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>Unidade</Label>
                      <Select value={product.unit} onValueChange={(value) => updateProduct(product.id, "unit", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UN">Unidade</SelectItem>
                          <SelectItem value="M">Metro</SelectItem>
                          <SelectItem value="M²">Metro²</SelectItem>
                          <SelectItem value="KG">Quilograma</SelectItem>
                          <SelectItem value="H">Hora</SelectItem>
                          <SelectItem value="SRV">Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valor Unitário (R$) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.unitPrice}
                        onChange={(e) => updateProduct(product.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-semibold text-red-600">
                      Total: R$ {product.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="text-right">
              <div className="text-3xl font-bold text-red-600">
                Total Geral: R$ {getTotalBudget().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-700">Condições Comerciais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
              <Select
                value={budgetData.paymentMethod}
                onValueChange={(value) => setBudgetData((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vista">À Vista</SelectItem>
                  <SelectItem value="30dias">30 dias</SelectItem>
                  <SelectItem value="2x">2x sem juros</SelectItem>
                  <SelectItem value="3x">3x sem juros</SelectItem>
                  <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="boleto">Boleto Bancário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={budgetData.observations}
                onChange={(e) => setBudgetData((prev) => ({ ...prev, observations: e.target.value }))}
                placeholder="Informações adicionais, condições especiais, prazo de entrega, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={saveBudget}
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
          >
            <Save className="h-4 w-4" />
            {editingBudget ? "Atualizar Orçamento" : "Salvar Orçamento"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <FileText className="h-4 w-4" />
            Visualizar Orçamento
          </Button>
          <Button onClick={() => setShowPreview(true)} className="gap-2 bg-red-600 hover:bg-red-700">
            <Printer className="h-4 w-4" />
            Gerar Orçamento
          </Button>
        </div>
      </div>
    </div>
  )
}

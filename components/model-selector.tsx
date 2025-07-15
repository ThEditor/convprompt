"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Zap, Brain, Sparkles } from "lucide-react"

const MODELS = [
  {
    id: "gpt-4",
    name: "GPT-4",
    provider: "OpenAI",
    costPer1K: 0.03,
    icon: Brain,
    tier: "premium",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    costPer1K: 0.01,
    icon: Zap,
    tier: "premium",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    costPer1K: 0.002,
    icon: Sparkles,
    tier: "standard",
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    costPer1K: 0.015,
    icon: Brain,
    tier: "premium",
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    costPer1K: 0.003,
    icon: Zap,
    tier: "standard",
  },
]

interface ModelSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const selectedModel = MODELS.find((m) => m.id === value) || MODELS[0]

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <div className="flex items-center gap-2">
          <selectedModel.icon className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {MODELS.map((model) => {
          const Icon = model.icon
          return (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-slate-500">{model.provider}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">${model.costPer1K}/1K</span>
                  <Badge variant={model.tier === "premium" ? "default" : "secondary"} className="text-xs">
                    {model.tier}
                  </Badge>
                </div>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

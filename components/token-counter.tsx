"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, TrendingUp, TrendingDown } from "lucide-react"

const MODELS = {
  "gpt-4": { costPer1K: 0.03, name: "GPT-4" },
  "gpt-4-turbo": { costPer1K: 0.01, name: "GPT-4 Turbo" },
  "gpt-3.5-turbo": { costPer1K: 0.002, name: "GPT-3.5 Turbo" },
  "claude-3-opus": { costPer1K: 0.015, name: "Claude 3 Opus" },
  "claude-3-sonnet": { costPer1K: 0.003, name: "Claude 3 Sonnet" },
}

interface TokenCounterProps {
  prompt: string
  model: string
}

export function TokenCounter({ prompt, model }: TokenCounterProps) {
  const { tokenCount, cost, trend } = useMemo(() => {
    // Simple token estimation (roughly 4 characters per token for English)
    const charCount = prompt.length
    const estimatedTokens = Math.ceil(charCount / 4)

    const modelInfo = MODELS[model as keyof typeof MODELS] || MODELS["gpt-4"]
    const estimatedCost = (estimatedTokens / 1000) * modelInfo.costPer1K

    // Simple trend calculation based on token count
    let trend: "up" | "down" | "stable" = "stable"
    if (estimatedTokens > 2000) trend = "up"
    else if (estimatedTokens < 500) trend = "down"

    return {
      tokenCount: estimatedTokens,
      cost: estimatedCost,
      trend,
    }
  }, [prompt, model])

  const getTokenColor = (count: number) => {
    if (count < 1000) return "bg-green-100 text-green-800 border-green-200"
    if (count < 2000) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (count < 4000) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Calculator

  return (
    <Card className="w-fit">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TrendIcon className="h-4 w-4 text-slate-600" />
            <Badge className={`${getTokenColor(tokenCount)} border`}>~{tokenCount.toLocaleString()} tokens</Badge>
          </div>
          <div className="text-xs text-slate-500">~${cost.toFixed(4)} per request</div>
        </div>
      </CardContent>
    </Card>
  )
}

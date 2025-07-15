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
			<SelectTrigger>
				<div className="flex items-center gap-2">
					<selectedModel.icon className="h-4 w-4" />
					<span>{selectedModel.name}</span>
					<span className="text-xs text-slate-500">${selectedModel.costPer1K}/1K</span>
					<Badge variant={selectedModel.tier === "premium" ? "default" : "secondary"} className="text-xs">
						{selectedModel.tier}
					</Badge>
				</div>
			</SelectTrigger>
			<SelectContent>
				{MODELS.map((model) => {
					return (
						<SelectItem key={model.id} value={model.id}>
							<div className="flex items-center gap-2 w-full">
								<model.icon className="h-4 w-4" />
								<span className="font-medium">{model.name}</span>
								<span className="text-xs text-slate-500">{model.provider}</span>
								<span className="text-xs text-slate-500 ml-auto">${model.costPer1K}/1K</span>
								<Badge variant={model.tier === "premium" ? "default" : "secondary"} className="text-xs">
									{model.tier}
								</Badge>
							</div>
						</SelectItem>
					)
				})}
			</SelectContent>
		</Select>
	)
}

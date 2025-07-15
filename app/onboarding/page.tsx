"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Bot, Target, MessageSquare, Globe, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

const STEPS = [
  { id: 1, title: "Basic Info", icon: Bot },
  { id: 2, title: "Goals & Purpose", icon: Target },
  { id: 3, title: "Language Setup", icon: Globe },
  { id: 4, title: "Initial Instructions", icon: MessageSquare },
  { id: 5, title: "Review & Create", icon: Sparkles },
]

const LANGUAGES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "en-IN", name: "English (India)" },
  { code: "hi-IN", name: "Hindi (India)" },
  { code: "bn-IN", name: "Bengali (India)" },
  { code: "te-IN", name: "Telugu (India)" },
  { code: "mr-IN", name: "Marathi (India)" },
  { code: "ta-IN", name: "Tamil (India)" },
  { code: "gu-IN", name: "Gujarati (India)" },
  { code: "kn-IN", name: "Kannada (India)" },
  { code: "ml-IN", name: "Malayalam (India)" },
  { code: "pa-IN", name: "Punjabi (India)" },
  { code: "or-IN", name: "Odia (India)" },
  { code: "as-IN", name: "Assamese (India)" },
  { code: "ur-IN", name: "Urdu (India)" },
  { code: "es-ES", name: "Spanish (Spain)" },
  { code: "fr-FR", name: "French (France)" },
  { code: "de-DE", name: "German (Germany)" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "ja-JP", name: "Japanese (Japan)" },
  { code: "ko-KR", name: "Korean (Korea)" },
  { code: "ar-SA", name: "Arabic (Saudi Arabia)" },
]

const BOT_TEMPLATES = [
  {
    id: "customer-support",
    name: "Customer Support",
    description: "Handle customer inquiries and provide helpful assistance",
    goals: "Provide excellent customer service, resolve issues efficiently, and maintain a helpful tone.",
    instructions:
      "Always be polite and professional. Ask clarifying questions when needed. Escalate complex issues appropriately.",
  },
  {
    id: "content-creator",
    name: "Content Creator",
    description: "Generate creative content and assist with writing tasks",
    goals: "Create engaging, original content that matches the user's style and requirements.",
    instructions: "Be creative and adaptable. Understand the target audience. Maintain consistency in tone and style.",
  },
  {
    id: "technical-assistant",
    name: "Technical Assistant",
    description: "Provide technical support and programming help",
    goals: "Offer accurate technical guidance, explain complex concepts clearly, and provide working solutions.",
    instructions:
      "Be precise and thorough. Provide code examples when helpful. Explain technical concepts in simple terms.",
  },
  {
    id: "custom",
    name: "Custom Bot",
    description: "Start from scratch with your own configuration",
    goals: "",
    instructions: "",
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template: "",
    goals: "",
    instructions: "",
    inputLanguages: ["en-US"],
    responseLanguages: ["en-US"],
    languageRules: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = BOT_TEMPLATES.find((t) => t.id === templateId)
    if (template) {
      setFormData((prev) => ({
        ...prev,
        template: templateId,
        goals: template.goals,
        instructions: template.instructions,
      }))
    }
  }

  const handleFinish = () => {
    // Create the bot configuration
    const botConfig = {
      id: `bot-${Date.now()}`,
      name: formData.name,
      config: {
        name: formData.name,
        description: formData.description,
        sections: [
          {
            id: "goals",
            title: "Goals",
            content: formData.goals,
            isPredefined: true,
            order: 0,
          },
          {
            id: "primary-instructions",
            title: "Primary Instructions",
            content: formData.instructions,
            isPredefined: true,
            order: 1,
          },
        ],
        inputLanguages: formData.inputLanguages,
        responseLanguages: formData.responseLanguages,
        languageRules: formData.languageRules,
        examples: [],
      },
      savedAt: new Date().toISOString(),
    }

    // Save to localStorage
    const existing = localStorage.getItem("savedBots")
    const bots = existing ? JSON.parse(existing) : []
    const updated = [...bots, botConfig]
    localStorage.setItem("savedBots", JSON.stringify(updated))
    localStorage.setItem("currentBotId", botConfig.id)

    toast({
      title: "Bot created successfully!",
      description: `"${formData.name}" is ready for configuration.`,
    })

    router.push("/builder")
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.description.trim()
      case 2:
        return formData.template
      case 3:
        return formData.inputLanguages.length > 0 && formData.responseLanguages.length > 0
      case 4:
        return formData.goals.trim() && formData.instructions.trim()
      case 5:
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Bot className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Let's create your AI bot</h2>
              <p className="text-slate-600">Start by giving your bot a name and description</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Bot Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Customer Support Assistant"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your bot will do..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Choose a template</h2>
              <p className="text-slate-600">Select a starting point for your bot</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BOT_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.template === template.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Language Configuration</h2>
              <p className="text-slate-600">Set up language preferences for your bot</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Input Languages</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {formData.inputLanguages.map((code) => (
                    <Badge key={code} variant="secondary">
                      {LANGUAGES.find((l) => l.code === code)?.name || code}
                    </Badge>
                  ))}
                </div>
                <Select
                  onValueChange={(value) => {
                    if (!formData.inputLanguages.includes(value)) {
                      setFormData((prev) => ({
                        ...prev,
                        inputLanguages: [...prev.inputLanguages, value],
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add input language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.filter((lang) => !formData.inputLanguages.includes(lang.code)).map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Response Languages</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {formData.responseLanguages.map((code) => (
                    <Badge key={code} variant="secondary">
                      {LANGUAGES.find((l) => l.code === code)?.name || code}
                    </Badge>
                  ))}
                </div>
                <Select
                  onValueChange={(value) => {
                    if (!formData.responseLanguages.includes(value)) {
                      setFormData((prev) => ({
                        ...prev,
                        responseLanguages: [...prev.responseLanguages, value],
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add response language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.filter((lang) => !formData.responseLanguages.includes(lang.code)).map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="languageRules">Language Rules (Optional)</Label>
                <Textarea
                  id="languageRules"
                  placeholder="Enter any specific language rules or guidelines..."
                  value={formData.languageRules}
                  onChange={(e) => setFormData((prev) => ({ ...prev, languageRules: e.target.value }))}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Core Instructions</h2>
              <p className="text-slate-600">Define your bot's goals and primary instructions</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="goals">Goals *</Label>
                <Textarea
                  id="goals"
                  placeholder="What are the main objectives for this AI assistant?"
                  value={formData.goals}
                  onChange={(e) => setFormData((prev) => ({ ...prev, goals: e.target.value }))}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="instructions">Primary Instructions *</Label>
                <Textarea
                  id="instructions"
                  placeholder="Core directives that govern the AI's behavior and responses..."
                  value={formData.instructions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Review & Create</h2>
              <p className="text-slate-600">Review your bot configuration before creating</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{formData.name}</CardTitle>
                <CardDescription>{formData.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Template</h4>
                  <Badge variant="outline">{BOT_TEMPLATES.find((t) => t.id === formData.template)?.name}</Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.inputLanguages.map((code) => (
                      <Badge key={code} variant="secondary" className="text-xs">
                        {LANGUAGES.find((l) => l.code === code)?.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Goals</h4>
                  <p className="text-sm text-slate-600 line-clamp-3">{formData.goals}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-slate-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="text-sm text-slate-500">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id <= currentStep ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  <div className={`p-2 rounded-full mb-2 ${step.id <= currentStep ? "bg-blue-100" : "bg-slate-100"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === STEPS.length ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleFinish}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create Bot
              </Button>
            </motion.div>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

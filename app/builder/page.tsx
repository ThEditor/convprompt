"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bot, Settings, Copy, Save, Menu, Plus, Check, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/sidebar"
import { SectionCard } from "@/components/section-card"
import { LanguageConfig } from "@/components/language-config"
import { ExamplesPanel } from "@/components/examples-panel"
import { ExamplesManager } from "@/components/examples-manager"
import { TokenCounter } from "@/components/token-counter"
import { ModelSelector } from "@/components/model-selector"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import yaml from "js-yaml"

interface Section {
  id: string
  title: string
  content: string
  isPredefined: boolean
  order: number
}

interface ConversationExample {
  id: string
  name: string
  messages: Array<{
    id: string
    entity: "Bot" | "User"
    content: string
  }>
}

interface BotConfig {
  name: string
  description?: string
  sections: Section[]
  inputLanguages: string[]
  responseLanguages: string[]
  languageRules: string
  examples: ConversationExample[]
}

export default function BuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [examplesPanelOpen, setExamplesPanelOpen] = useState(false)
  const [currentBot, setCurrentBot] = useState<BotConfig | null>(null)
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [compiledPrompt, setCompiledPrompt] = useState("")
  const [showCreateExample, setShowCreateExample] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    loadCurrentBot()
  }, [])

  useEffect(() => {
    if (currentBot) {
      compilePrompt()
    }
  }, [currentBot, selectedModel])

  // Listen for bot changes from sidebar
  useEffect(() => {
    const handleStorageChange = () => {
      loadCurrentBot()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event from sidebar
    const handleBotChange = () => {
      loadCurrentBot()
    }
    
    window.addEventListener('botChanged', handleBotChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('botChanged', handleBotChange)
    }
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (currentBot && autoSaveEnabled) {
      const timeoutId = setTimeout(() => {
        saveCurrentBot()
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [currentBot, autoSaveEnabled])

  const loadCurrentBot = () => {
    const botId = localStorage.getItem("currentBotId")
    if (!botId) {
      // No bot ID found, redirect to dashboard
      router.push("/")
      return
    }

    const saved = localStorage.getItem("savedBots")
    if (saved) {
      try {
        const bots = JSON.parse(saved)
        const bot = bots.find((b: any) => b.id === botId)
        if (bot && bot.config) {
          setCurrentBot(bot.config)
        } else {
          // Bot not found, redirect to dashboard
          toast({
            title: "Bot not found",
            description: "The requested bot could not be found.",
            variant: "destructive",
          })
          router.push("/")
        }
      } catch (error) {
        console.error("Error loading bot:", error)
        toast({
          title: "Loading error",
          description: "Failed to load bot configuration.",
          variant: "destructive",
        })
        router.push("/")
      }
    } else {
      // No saved bots, redirect to dashboard
      router.push("/")
    }
  }

  const compilePrompt = () => {
    if (!currentBot) return

    let prompt = ""
    const sortedSections = [...currentBot.sections].sort((a, b) => a.order - b.order)

    sortedSections.forEach((section, index) => {
      if (index > 0) prompt += "\n\n"
      prompt += `# ${section.title}\n\n${section.content}`
    })

    if (
      currentBot.inputLanguages.length > 0 ||
      currentBot.responseLanguages.length > 0 ||
      currentBot.languageRules.trim()
    ) {
      prompt += "\n\n# Language Configuration\n\n"
      if (currentBot.inputLanguages.length > 0) {
        prompt += `**Input Languages:** ${currentBot.inputLanguages.join(", ")}\n\n`
      }
      if (currentBot.responseLanguages.length > 0) {
        prompt += `**Response Languages:** ${currentBot.responseLanguages.join(", ")}\n\n`
      }
      if (currentBot.languageRules.trim()) {
        prompt += `**Language Rules:**\n${currentBot.languageRules}\n\n`
      }
    }

    if (currentBot.examples.length > 0) {
      prompt += "\n\n# Conversation Examples\n\n"
      currentBot.examples.forEach((example, index) => {
        prompt += `## Example ${index + 1}: ${example.name}\n\n`
        example.messages.forEach((message) => {
          prompt += `**${message.entity}:** ${message.content}\n\n`
        })
      })
    }

    setCompiledPrompt(prompt)
  }

  const saveCurrentBot = () => {
    if (!currentBot) return

    const botId = localStorage.getItem("currentBotId")
    if (botId) {
      const saved = localStorage.getItem("savedBots")
      if (saved) {
        const bots = JSON.parse(saved)
        const botIndex = bots.findIndex((b: any) => b.id === botId)
        if (botIndex !== -1) {
          bots[botIndex].config = currentBot
          bots[botIndex].savedAt = new Date().toISOString()
          localStorage.setItem("savedBots", JSON.stringify(bots))
          setLastSaved(new Date())
        }
      }
    }
  }

  const updateBot = (updates: Partial<BotConfig>) => {
    if (!currentBot) return
    const updated = { ...currentBot, ...updates }
    setCurrentBot(updated)
  }

  const addCustomSection = () => {
    if (!currentBot) return
    const newSection: Section = {
      id: `custom-${Date.now()}`,
      title: "New Section",
      content: "Enter your instructions here...",
      isPredefined: false,
      order: currentBot.sections.length,
    }
    updateBot({ sections: [...currentBot.sections, newSection] })
  }

  const updateSection = (id: string, updates: Partial<Section>) => {
    if (!currentBot) return
    const updatedSections = currentBot.sections.map((section) =>
      section.id === id ? { ...section, ...updates } : section,
    )
    updateBot({ sections: updatedSections })
  }

  const deleteSection = (id: string) => {
    if (!currentBot) return
    const updatedSections = currentBot.sections.filter((section) => section.id !== id)
    updateBot({ sections: updatedSections })
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!currentBot || active.id === over.id) return

    const customSections = currentBot.sections.filter((s) => !s.isPredefined)
    const oldIndex = customSections.findIndex((s) => s.id === active.id)
    const newIndex = customSections.findIndex((s) => s.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedCustomSections = arrayMove(customSections, oldIndex, newIndex)
      const predefinedSections = currentBot.sections.filter((s) => s.isPredefined)

      const updatedSections = [
        ...predefinedSections,
        ...reorderedCustomSections.map((section, index) => ({
          ...section,
          order: predefinedSections.length + index,
        })),
      ]

      updateBot({ sections: updatedSections })
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(compiledPrompt)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
      toast({
        title: "Copied to clipboard",
        description: "The compiled system prompt has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLoadBot = (config: BotConfig) => {
    setCurrentBot(config)
    toast({
      title: "Bot loaded",
      description: `"${config.name}" has been loaded successfully.`,
    })
  }

  const handleManualSave = () => {
    saveCurrentBot()
    toast({
      title: "Bot saved",
      description: "Your bot configuration has been saved successfully.",
    })
  }

  const downloadAsYAML = () => {
    if (!currentBot) return
    
    try {
      const yamlContent = yaml.dump(currentBot, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const blob = new Blob([yamlContent], { type: "text/yaml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${currentBot.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.yaml`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "YAML file has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to generate YAML file. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!currentBot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading bot configuration...</p>
        </div>
      </div>
    )
  }

  const predefinedSections = currentBot.sections.filter((s) => s.isPredefined)
  const customSections = currentBot.sections.filter((s) => !s.isPredefined)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{currentBot.name}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-500">{currentBot.description}</p>
                  {lastSaved && (
                    <Badge variant="outline" className="text-xs">
                      Auto-saved {lastSaved.toLocaleTimeString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ModelSelector value={selectedModel} onChange={setSelectedModel} />
              <TokenCounter prompt={compiledPrompt} model={selectedModel} />
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" onClick={downloadAsYAML}>
                <Download className="h-4 w-4 mr-2" />
                Download YAML
              </Button>
              <Button variant="outline" onClick={copyToClipboard}>
                {copySuccess ? (
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copySuccess ? "Copied!" : "Copy Prompt"}
              </Button>
              <Button onClick={handleManualSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Tabs defaultValue="builder" className="h-full">
            <div className="border-b bg-white px-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="examples">
                  Examples ({currentBot.examples.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="builder" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Language Config & Core Sections */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Language Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LanguageConfig
                        inputLanguages={currentBot.inputLanguages}
                        responseLanguages={currentBot.responseLanguages}
                        languageRules={currentBot.languageRules}
                        onInputLanguagesChange={(languages) => updateBot({ inputLanguages: languages })}
                        onResponseLanguagesChange={(languages) => updateBot({ responseLanguages: languages })}
                        onLanguageRulesChange={(rules) => updateBot({ languageRules: rules })}
                      />
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">Core Sections</h2>
                      <Badge variant="secondary">Required</Badge>
                    </div>
                    {predefinedSections.map((section) => (
                      <SectionCard
                        key={section.id}
                        section={section}
                        onUpdate={updateSection}
                        onDelete={deleteSection}
                        isDraggable={false}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Column - Custom Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Custom Sections</h2>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button onClick={addCustomSection} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
                    </motion.div>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext items={customSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        <AnimatePresence>
                          {customSections.map((section) => (
                            <motion.div
                              key={section.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <SectionCard
                                section={section}
                                onUpdate={updateSection}
                                onDelete={deleteSection}
                                isDraggable={true}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>

                  {customSections.length === 0 && (
                    <Card className="border-dashed border-2 border-slate-200">
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Plus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 mb-2">No custom sections yet</p>
                          <p className="text-sm text-slate-500">Add sections to customize your AI prompt</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Compiled System Prompt Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-slate-100 p-4 rounded-lg max-h-96 overflow-y-auto font-mono">
                    {compiledPrompt || "Your compiled prompt will appear here..."}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="p-6">
              <ExamplesManager
                examples={currentBot.examples}
                onExamplesChange={(examples) => updateBot({ examples })}
                onCreateNew={() => setShowCreateExample(true)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Examples Creation Panel */}
      <ExamplesPanel
        isOpen={showCreateExample}
        onClose={() => setShowCreateExample(false)}
        examples={currentBot.examples}
        onExamplesChange={(examples) => updateBot({ examples })}
        mode="create"
      />
    </div>
  )
}

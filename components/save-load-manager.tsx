"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Download, Upload, Trash2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import yaml from "js-yaml"

interface ConversationExample {
  id: string
  name: string
  messages: Array<{
    id: string
    entity: "Bot" | "User"
    content: string
  }>
}

interface Section {
  id: string
  title: string
  content: string
  isPredefined: boolean
  order: number
}

interface BotConfig {
  name: string
  sections: Section[]
  inputLanguages: string[]
  responseLanguages: string[]
  languageRules: string
  examples: ConversationExample[]
}

interface SavedBot {
  id: string
  name: string
  config: BotConfig
  savedAt: string
}

interface SaveLoadManagerProps {
  config: BotConfig
  onLoad: (config: BotConfig) => void
}

export function SaveLoadManager({ config, onLoad }: SaveLoadManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [savedBots, setSavedBots] = useState<SavedBot[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load saved bots from localStorage when dialog opens
  const loadSavedBots = () => {
    const saved = localStorage.getItem("savedBots")
    if (saved) {
      try {
        setSavedBots(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading saved bots:", error)
        setSavedBots([])
      }
    }
  }

  const saveToLocalStorage = () => {
    const savedBot: SavedBot = {
      id: `bot-${Date.now()}`,
      name: config.name,
      config,
      savedAt: new Date().toISOString(),
    }

    const existing = localStorage.getItem("savedBots")
    const bots = existing ? JSON.parse(existing) : []
    const updated = [...bots, savedBot]

    localStorage.setItem("savedBots", JSON.stringify(updated))
    setSavedBots(updated)

    toast({
      title: "Bot saved",
      description: `"${config.name}" has been saved to local storage.`,
    })
  }

  const loadFromLocalStorage = (savedBot: SavedBot) => {
    onLoad(savedBot.config)
    setIsOpen(false)
    toast({
      title: "Bot loaded",
      description: `"${savedBot.name}" has been loaded successfully.`,
    })
  }

  const deleteFromLocalStorage = (id: string) => {
    const updated = savedBots.filter((bot) => bot.id !== id)
    setSavedBots(updated)
    localStorage.setItem("savedBots", JSON.stringify(updated))

    toast({
      title: "Bot deleted",
      description: "Bot configuration has been removed from local storage.",
    })
  }

  const downloadAsYAML = () => {
    try {
      const yamlContent = yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const blob = new Blob([yamlContent], { type: "text/yaml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${config.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.yaml`
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const loadedConfig = yaml.load(content) as BotConfig

        // Validate the loaded config has required fields
        if (!loadedConfig.name || !loadedConfig.sections) {
          throw new Error("Invalid configuration file")
        }

        onLoad(loadedConfig)
        setIsOpen(false)
        toast({
          title: "File loaded",
          description: `"${loadedConfig.name}" has been loaded from YAML file.`,
        })
      } catch (error) {
        toast({
          title: "Load failed",
          description: "Failed to load YAML file. Please check the file format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (open) loadSavedBots()
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save / Load
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Save & Load Bot Configurations</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Save Options */}
            <div className="space-y-3">
              <h3 className="font-semibold">Save Current Bot</h3>
              <div className="flex gap-2">
                <Button onClick={saveToLocalStorage} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save to Browser
                </Button>
                <Button onClick={downloadAsYAML} variant="outline" className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download YAML
                </Button>
              </div>
            </div>

            {/* Load Options */}
            <div className="space-y-3">
              <h3 className="font-semibold">Load Bot Configuration</h3>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".yaml,.yml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Load from YAML
                </Button>
              </div>
            </div>

            {/* Saved Bots */}
            {savedBots.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Saved Bots ({savedBots.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedBots.map((bot) => (
                    <Card key={bot.id} className="cursor-pointer hover:bg-slate-50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{bot.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {bot.config.sections.length} sections
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteFromLocalStorage(bot.id)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(bot.savedAt).toLocaleDateString()} at {new Date(bot.savedAt).toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button size="sm" onClick={() => loadFromLocalStorage(bot)} className="w-full">
                          Load Bot
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

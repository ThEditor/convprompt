"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Calendar, Zap, Trash2, Edit2, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import yaml from "js-yaml"

interface SavedBot {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  sectionsCount: number
  examplesCount: number
}

export default function HomePage() {
  const [bots, setBots] = useState<SavedBot[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadBots()
  }, [])

  const loadBots = () => {
    setIsLoading(true)
    setTimeout(() => {
      const saved = localStorage.getItem("savedBots")
      if (saved) {
        try {
          const parsedBots = JSON.parse(saved)
          setBots(
            parsedBots.map((bot: any) => ({
              id: bot.id,
              name: bot.name,
              description: bot.config?.description || "No description available",
              createdAt: bot.savedAt,
              updatedAt: bot.savedAt,
              sectionsCount: bot.config?.sections?.length || 0,
              examplesCount: bot.config?.examples?.length || 0,
            })),
          )
        } catch (error) {
          console.error("Error loading bots:", error)
          setBots([])
        }
      }
      setIsLoading(false)
    }, 500)
  }

  const deleteBot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const saved = localStorage.getItem("savedBots")
    if (saved) {
      const bots = JSON.parse(saved)
      const updated = bots.filter((bot: any) => bot.id !== id)
      localStorage.setItem("savedBots", JSON.stringify(updated))
      loadBots()
      toast({
        title: "Bot deleted",
        description: "Bot has been permanently deleted.",
      })
    }
  }

  const filteredBots = bots.filter((bot) => bot.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreateNew = () => {
    router.push("/onboarding")
  }

  const handleBotSelect = (botId: string) => {
    localStorage.setItem("currentBotId", botId)
    router.push("/builder")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const loadedConfig = yaml.load(content) as any

        // Validate the loaded config has required fields
        if (!loadedConfig.name || !loadedConfig.sections) {
          throw new Error("Invalid configuration file")
        }

        // Create a new bot from the loaded config
        const botId = `bot-${Date.now()}`
        const botConfig = {
          id: botId,
          name: loadedConfig.name,
          config: {
            name: loadedConfig.name,
            description: loadedConfig.description || "",
            sections: loadedConfig.sections,
            inputLanguages: loadedConfig.inputLanguages || ["en-US"],
            responseLanguages: loadedConfig.responseLanguages || ["en-US"],
            languageRules: loadedConfig.languageRules || "",
            examples: loadedConfig.examples || [],
          },
          savedAt: new Date().toISOString(),
        }

        // Save to localStorage
        const existing = localStorage.getItem("savedBots")
        const bots = existing ? JSON.parse(existing) : []
        bots.push(botConfig)
        localStorage.setItem("savedBots", JSON.stringify(bots))

        // Reload bots and show success message
        loadBots()
        toast({
          title: "Bot imported",
          description: `"${loadedConfig.name}" has been imported successfully.`,
        })
      } catch (error) {
        toast({
          title: "Import failed",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <img src="/favicon.svg" alt="ConvPrompt" className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  ConvPrompt
                </h1>
                <p className="text-sm text-slate-500">Build sophisticated AI system prompts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".yaml,.yml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import YAML
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Bot
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Stats */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search your bots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>{bots.length} bots created</span>
          </div>
        </div>

        {/* Bots Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : filteredBots.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <img src="/favicon.svg" alt="ConvPrompt" className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {searchQuery ? "No bots found" : "No bots created yet"}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? `No bots match "${searchQuery}". Try a different search term.`
                  : "Get started by creating your first AI bot with our intuitive prompt builder."}
              </p>
              {!searchQuery && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleCreateNew}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Bot
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredBots.map((bot, index) => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Card
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-blue-200 bg-white/70 hover:bg-white backdrop-blur-sm"
                    onClick={() => handleBotSelect(bot.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                            {bot.name}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">{bot.description}</CardDescription>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Edit functionality
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => deleteBot(bot.id, e)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(bot.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-3">
                          <span>{bot.sectionsCount} sections</span>
                          <span>{bot.examplesCount} examples</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          v1.0
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

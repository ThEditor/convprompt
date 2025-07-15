"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Home, Plus, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter()
  const [recentBots, setRecentBots] = useState<Array<{ id: string; name: string; status: string }>>([])

  useEffect(() => {
    loadRecentBots()
  }, [])

  const loadRecentBots = () => {
    const saved = localStorage.getItem("savedBots")
    if (saved) {
      try {
        const bots = JSON.parse(saved)
        const recent = bots.slice(-3).reverse().map((bot: any) => ({
          id: bot.id,
          name: bot.name || bot.config?.name || "Unnamed Bot",
          status: "active"
        }))
        setRecentBots(recent)
      } catch (error) {
        console.error("Error loading recent bots:", error)
        setRecentBots([])
      }
    }
  }

  const handleBotClick = (botId: string) => {
    localStorage.setItem("currentBotId", botId)
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('botChanged'))
    
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      onToggle()
    }
    
    // Don't navigate away from builder if we're already there
    if (window.location.pathname !== '/builder') {
      router.push("/builder")
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <img src="/favicon.svg" alt="ConvPrompt" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">ConvPrompt</h2>
                <p className="text-xs text-slate-500">v0.2</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/")}>
            <Home className="h-4 w-4 mr-3" />
            Dashboard
          </Button>

          <Separator className="my-4" />

          {/* Recent Bots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">Recent Bots</h3>
              <Button size="sm" variant="ghost" onClick={() => router.push("/onboarding")} className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-1">
              {recentBots.map((bot) => (
                <Card
                  key={bot.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => handleBotClick(bot.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{bot.name}</p>
                      </div>
                      <Badge variant={bot.status === "active" ? "default" : "secondary"} className="ml-2 text-xs">
                        {bot.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {recentBots.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No bots created yet</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

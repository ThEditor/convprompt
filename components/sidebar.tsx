"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bot, Home, Settings, HelpCircle, Plus, ChevronLeft, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter()
  const [recentBots] = useState([
    { id: "1", name: "Customer Support", status: "active" },
    { id: "2", name: "Content Creator", status: "draft" },
    { id: "3", name: "Technical Assistant", status: "active" },
  ])

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
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">AI Builder</h2>
                <p className="text-xs text-slate-500">v2.0</p>
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

          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>

          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="h-4 w-4 mr-3" />
            Help & Support
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
                  onClick={() => {
                    localStorage.setItem("currentBotId", bot.id)
                    router.push("/builder")
                  }}
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-blue-700 mb-3">Unlock advanced features and unlimited bots</p>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  )
}

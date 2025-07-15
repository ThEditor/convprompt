"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { X, Plus, MessageSquare, User, Bot, Send, Trash2, Save } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  entity: "Bot" | "User"
  content: string
}

interface ConversationExample {
  id: string
  name: string
  messages: Message[]
}

interface ExamplesPanelProps {
  isOpen: boolean
  onClose: () => void
  examples: ConversationExample[]
  onExamplesChange: (examples: ConversationExample[]) => void
}

export function ExamplesPanel({ isOpen, onClose, examples, onExamplesChange }: ExamplesPanelProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [currentExample, setCurrentExample] = useState<Partial<ConversationExample>>({
    name: "",
    messages: [],
  })
  const [currentMessage, setCurrentMessage] = useState("")
  const [currentEntity, setCurrentEntity] = useState<"Bot" | "User">("User")
  const { toast } = useToast()

  const addMessage = () => {
    if (!currentMessage.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      entity: currentEntity,
      content: currentMessage.trim(),
    }

    setCurrentExample((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), newMessage],
    }))
    setCurrentMessage("")
    setCurrentEntity(currentEntity === "User" ? "Bot" : "User")
  }

  const removeMessage = (id: string) => {
    setCurrentExample((prev) => ({
      ...prev,
      messages: (prev.messages || []).filter((msg) => msg.id !== id),
    }))
  }

  const saveExample = () => {
    if (!currentExample.name?.trim() || !currentExample.messages?.length) {
      toast({
        title: "Invalid example",
        description: "Please provide a name and at least one message.",
        variant: "destructive",
      })
      return
    }

    const newExample: ConversationExample = {
      id: `example-${Date.now()}`,
      name: currentExample.name.trim(),
      messages: currentExample.messages,
    }

    onExamplesChange([...examples, newExample])
    setCurrentExample({ name: "", messages: [] })
    setIsCreating(false)
    toast({
      title: "Example saved",
      description: "Conversation example has been added successfully.",
    })
  }

  const deleteExample = (id: string) => {
    onExamplesChange(examples.filter((ex) => ex.id !== id))
    toast({
      title: "Example deleted",
      description: "Conversation example has been removed.",
    })
  }

  const startCreating = () => {
    setIsCreating(true)
    setCurrentExample({ name: "", messages: [] })
    setCurrentMessage("")
    setCurrentEntity("User")
  }

  const cancelCreating = () => {
    setIsCreating(false)
    setCurrentExample({ name: "", messages: [] })
    setCurrentMessage("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <h2 className="font-semibold text-slate-900">Examples</h2>
                    <p className="text-sm text-slate-500">{examples.length} conversations</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {isCreating ? (
                /* Creating New Example */
                <div className="flex-1 p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Example Name</label>
                    <Input
                      value={currentExample.name || ""}
                      onChange={(e) => setCurrentExample((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Customer Greeting"
                      className="mt-1"
                    />
                  </div>

                  <Separator />

                  {/* Messages */}
                  <div className="flex-1 space-y-3">
                    <label className="text-sm font-medium text-slate-700">Conversation</label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {currentExample.messages?.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg flex items-start gap-2 ${
                            message.entity === "Bot"
                              ? "bg-blue-50 border-l-2 border-blue-200"
                              : "bg-green-50 border-l-2 border-green-200"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {message.entity === "Bot" ? (
                                <Bot className="h-3 w-3 text-blue-600" />
                              ) : (
                                <User className="h-3 w-3 text-green-600" />
                              )}
                              <span className="text-xs font-medium text-slate-600">{message.entity}</span>
                            </div>
                            <p className="text-sm text-slate-700">{message.content}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMessage(message.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Select
                          value={currentEntity}
                          onValueChange={(value: "Bot" | "User") => setCurrentEntity(value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="User">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                User
                              </div>
                            </SelectItem>
                            <SelectItem value="Bot">
                              <div className="flex items-center gap-2">
                                <Bot className="h-3 w-3" />
                                Bot
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex-1 relative">
                          <Textarea
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                addMessage()
                              }
                            }}
                            placeholder="Type a message..."
                            rows={2}
                            className="resize-none pr-10"
                          />
                          <Button
                            size="sm"
                            onClick={addMessage}
                            disabled={!currentMessage.trim()}
                            className="absolute right-2 bottom-2 h-6 w-6 p-0"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={saveExample}
                      disabled={!currentExample.name?.trim() || !currentExample.messages?.length}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Example
                    </Button>
                    <Button variant="outline" onClick={cancelCreating}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* Examples List */
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-slate-900">Saved Examples</h3>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button size="sm" onClick={startCreating}>
                          <Plus className="h-4 w-4 mr-2" />
                          New Example
                        </Button>
                      </motion.div>
                    </div>

                    {examples.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 mb-2">No examples yet</p>
                        <p className="text-sm text-slate-500 mb-4">
                          Create conversation examples to help train your AI
                        </p>
                        <Button onClick={startCreating}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Example
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {examples.map((example, index) => (
                          <motion.div
                            key={example.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">{example.name}</CardTitle>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      {example.messages.length} messages
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteExample(example.id)}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {example.messages.slice(0, 3).map((message) => (
                                    <div
                                      key={message.id}
                                      className={`p-2 rounded text-xs ${
                                        message.entity === "Bot"
                                          ? "bg-blue-50 border-l-2 border-blue-200"
                                          : "bg-green-50 border-l-2 border-green-200"
                                      }`}
                                    >
                                      <div className="flex items-center gap-1 mb-1">
                                        {message.entity === "Bot" ? (
                                          <Bot className="h-2 w-2 text-blue-600" />
                                        ) : (
                                          <User className="h-2 w-2 text-green-600" />
                                        )}
                                        <span className="font-medium">{message.entity}:</span>
                                      </div>
                                      <p className="text-slate-700 line-clamp-2">{message.content}</p>
                                    </div>
                                  ))}
                                  {example.messages.length > 3 && (
                                    <p className="text-xs text-slate-500 text-center">
                                      +{example.messages.length - 3} more messages
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

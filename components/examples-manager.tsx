"use client"

import type React from "react"

import { useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, MessageSquare, GripVertical, Trash2, Edit2, Save, X } from "lucide-react"
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

interface ExamplesManagerProps {
  examples: ConversationExample[]
  onExamplesChange: (examples: ConversationExample[]) => void
}

function SortableExampleCard({
  example,
  onUpdate,
  onDelete,
}: {
  example: ConversationExample
  onUpdate: (id: string, updates: Partial<ConversationExample>) => void
  onDelete: (id: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(example.name)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: example.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSave = () => {
    onUpdate(example.id, { name: tempName })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempName(example.name)
    setIsEditing(false)
  }

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? "shadow-lg" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-slate-400" />
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave()
                  if (e.key === "Escape") handleCancel()
                }}
                className="flex-1"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <CardTitle className="flex-1">{example.name}</CardTitle>
              <Badge variant="outline">{example.messages.length} messages</Badge>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(example.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {example.messages.map((message, index) => (
            <div
              key={message.id}
              className={`p-2 rounded text-sm ${
                message.entity === "Bot"
                  ? "bg-blue-50 border-l-2 border-blue-200"
                  : "bg-green-50 border-l-2 border-green-200"
              }`}
            >
              <div className="font-medium text-xs mb-1">{message.entity}:</div>
              <div className="text-slate-700">{message.content}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ExampleCreator({
  onSave,
  onCancel,
}: {
  onSave: (example: Omit<ConversationExample, "id">) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [currentEntity, setCurrentEntity] = useState<"Bot" | "User">("User")
  const { toast } = useToast()

  const addMessage = () => {
    if (!currentMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message before adding.",
        variant: "destructive",
      })
      return
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      entity: currentEntity,
      content: currentMessage.trim(),
    }

    setMessages([...messages, newMessage])
    setCurrentMessage("")
    setCurrentEntity(currentEntity === "User" ? "Bot" : "User") // Auto-alternate
  }

  const removeMessage = (id: string) => {
    setMessages(messages.filter((msg) => msg.id !== id))
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this conversation example.",
        variant: "destructive",
      })
      return
    }

    if (messages.length === 0) {
      toast({
        title: "Messages required",
        description: "Please add at least one message to the conversation.",
        variant: "destructive",
      })
      return
    }

    onSave({ name: name.trim(), messages })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addMessage()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Example Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Customer Support Greeting" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Messages</label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`p-3 rounded flex items-start gap-2 ${
                message.entity === "Bot"
                  ? "bg-blue-50 border-l-2 border-blue-200"
                  : "bg-green-50 border-l-2 border-green-200"
              }`}
            >
              <div className="flex-1">
                <div className="font-medium text-xs mb-1">{message.entity}:</div>
                <div className="text-sm text-slate-700">{message.content}</div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeMessage(message.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Select value={currentEntity} onValueChange={(value: "Bot" | "User") => setCurrentEntity(value)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Bot">Bot</SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message and press Enter to add..."
          rows={2}
          className="flex-1 resize-none"
        />
        <Button onClick={addMessage} disabled={!currentMessage.trim()}>
          Add
        </Button>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={handleSave} disabled={!name.trim() || messages.length === 0}>
          Save Example
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function ExamplesManager({ examples, onExamplesChange }: ExamplesManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = examples.findIndex((ex) => ex.id === active.id)
      const newIndex = examples.findIndex((ex) => ex.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        onExamplesChange(arrayMove(examples, oldIndex, newIndex))
      }
    }
  }

  const addExample = (exampleData: Omit<ConversationExample, "id">) => {
    const newExample: ConversationExample = {
      id: `example-${Date.now()}`,
      ...exampleData,
    }
    onExamplesChange([...examples, newExample])
    setIsCreating(false)
    toast({
      title: "Example added",
      description: "Conversation example has been added successfully.",
    })
  }

  const updateExample = (id: string, updates: Partial<ConversationExample>) => {
    onExamplesChange(examples.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex)))
  }

  const deleteExample = (id: string) => {
    onExamplesChange(examples.filter((ex) => ex.id !== id))
    toast({
      title: "Example deleted",
      description: "Conversation example has been removed.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Conversation Examples</h2>
          <p className="text-sm text-slate-600">Add example conversations to help train your AI assistant</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Example
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Conversation Example</DialogTitle>
            </DialogHeader>
            <ExampleCreator onSave={addExample} onCancel={() => setIsCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {examples.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={examples.map((ex) => ex.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {examples.map((example) => (
                <SortableExampleCard
                  key={example.id}
                  example={example}
                  onUpdate={updateExample}
                  onDelete={deleteExample}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">No conversation examples yet</p>
              <p className="text-sm text-slate-500">Add examples to help train your AI assistant</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

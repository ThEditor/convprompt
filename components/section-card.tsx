"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GripVertical, Edit2, Trash2, Check, X } from "lucide-react"

interface Section {
  id: string
  title: string
  content: string
  isPredefined: boolean
  order: number
}

interface SectionCardProps {
  section: Section
  onUpdate: (id: string, updates: Partial<Section>) => void
  onDelete: (id: string) => void
  isDraggable: boolean
}

export function SectionCard({ section, onUpdate, onDelete, isDraggable }: SectionCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [tempTitle, setTempTitle] = useState(section.title)
  const [tempContent, setTempContent] = useState(section.content)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: !isDraggable,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleTitleSave = () => {
    onUpdate(section.id, { title: tempTitle })
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setTempTitle(section.title)
    setIsEditingTitle(false)
  }

  const handleContentSave = () => {
    onUpdate(section.id, { content: tempContent })
    setIsEditingContent(false)
  }

  const handleContentCancel = () => {
    setTempContent(section.content)
    setIsEditingContent(false)
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "shadow-lg" : ""} ${section.isPredefined ? "border-blue-200 bg-blue-50/30" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {isDraggable && (
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-slate-400" />
            </div>
          )}

          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSave()
                  if (e.key === "Escape") handleTitleCancel()
                }}
                className="flex-1"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleTitleSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleTitleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <h3 className="font-semibold flex-1">{section.title}</h3>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              {!section.isPredefined && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(section.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isEditingContent ? (
          <div className="space-y-2">
            <Textarea
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              rows={6}
              className="resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleContentSave}>
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleContentCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="cursor-pointer p-2 rounded border-2 border-dashed border-transparent hover:border-slate-300 transition-colors"
            onClick={() => setIsEditingContent(true)}
          >
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{section.content || "Click to add content..."}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

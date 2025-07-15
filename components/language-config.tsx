"use client"

import { CommandEmpty } from "@/components/ui/command"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandList, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { ChevronDown, X, Plus } from "lucide-react"

const LANGUAGES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "en-IN", name: "English (India)" },
  { code: "es-ES", name: "Spanish (Spain)" },
  { code: "es-MX", name: "Spanish (Mexico)" },
  { code: "fr-FR", name: "French (France)" },
  { code: "de-DE", name: "German (Germany)" },
  { code: "it-IT", name: "Italian (Italy)" },
  { code: "pt-BR", name: "Portuguese (Brazil)" },
  { code: "pt-PT", name: "Portuguese (Portugal)" },
  { code: "ru-RU", name: "Russian (Russia)" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "ja-JP", name: "Japanese (Japan)" },
  { code: "ko-KR", name: "Korean (Korea)" },
  { code: "hi-IN", name: "Hindi (India)" },
  { code: "ar-SA", name: "Arabic (Saudi Arabia)" },
  { code: "th-TH", name: "Thai (Thailand)" },
  { code: "vi-VN", name: "Vietnamese (Vietnam)" },
  { code: "nl-NL", name: "Dutch (Netherlands)" },
]

const SAMPLE_LANGUAGE_RULES = [
  "Always respond in the same language as the user input",
  "Use formal tone when responding in professional contexts",
  "Adapt cultural references to the target language and region",
  "Use appropriate honorifics and politeness levels for Asian languages",
  "Maintain consistent terminology throughout the conversation",
  "Provide translations or explanations for technical terms when needed",
  "Use gender-neutral language when possible",
  "Respect regional variations in vocabulary and expressions",
]

interface LanguageConfigProps {
  inputLanguages: string[]
  responseLanguages: string[]
  languageRules: string
  onInputLanguagesChange: (languages: string[]) => void
  onResponseLanguagesChange: (languages: string[]) => void
  onLanguageRulesChange: (rules: string) => void
}

export function LanguageConfig({
  inputLanguages,
  responseLanguages,
  languageRules,
  onInputLanguagesChange,
  onResponseLanguagesChange,
  onLanguageRulesChange,
}: LanguageConfigProps) {
  const [inputOpen, setInputOpen] = useState(false)
  const [responseOpen, setResponseOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)

  const getLanguageName = (code: string) => {
    return LANGUAGES.find((lang) => lang.code === code)?.name || code
  }

  const addInputLanguage = (code: string) => {
    if (!inputLanguages.includes(code)) {
      onInputLanguagesChange([...inputLanguages, code])
    }
    setInputOpen(false)
  }

  const removeInputLanguage = (code: string) => {
    onInputLanguagesChange(inputLanguages.filter((lang) => lang !== code))
  }

  const addResponseLanguage = (code: string) => {
    if (!responseLanguages.includes(code)) {
      onResponseLanguagesChange([...responseLanguages, code])
    }
    setResponseOpen(false)
  }

  const removeResponseLanguage = (code: string) => {
    onResponseLanguagesChange(responseLanguages.filter((lang) => lang !== code))
  }

  const addSampleRule = (rule: string) => {
    const currentRules = languageRules.trim()
    const newRules = currentRules ? `${currentRules}\n• ${rule}` : `• ${rule}`
    onLanguageRulesChange(newRules)
    setRulesOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Input Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {inputLanguages.map((code) => (
              <Badge key={code} variant="secondary" className="flex items-center gap-1">
                {getLanguageName(code)}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeInputLanguage(code)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>

          <Popover open={inputOpen} onOpenChange={setInputOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-transparent">
                Add Input Language
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search languages..." />
                <CommandList>
                  <CommandEmpty>No language found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-y-auto">
                    {LANGUAGES.filter((lang) => !inputLanguages.includes(lang.code)).map((language) => (
                      <CommandItem key={language.code} onSelect={() => addInputLanguage(language.code)}>
                        {language.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {responseLanguages.map((code) => (
              <Badge key={code} variant="secondary" className="flex items-center gap-1">
                {getLanguageName(code)}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeResponseLanguage(code)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>

          <Popover open={responseOpen} onOpenChange={setResponseOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-transparent">
                Add Response Language
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search languages..." />
                <CommandList>
                  <CommandEmpty>No language found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-y-auto">
                    {LANGUAGES.filter((lang) => !responseLanguages.includes(lang.code)).map((language) => (
                      <CommandItem key={language.code} onSelect={() => addResponseLanguage(language.code)}>
                        {language.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Language Rules</CardTitle>
            <Popover open={rulesOpen} onOpenChange={setRulesOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sample Rule
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Sample Language Rules</h4>
                  <div className="space-y-1">
                    {SAMPLE_LANGUAGE_RULES.map((rule, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full text-left justify-start h-auto p-2 text-sm"
                        onClick={() => addSampleRule(rule)}
                      >
                        {rule}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter language-specific rules and guidelines..."
            value={languageRules}
            onChange={(e) => onLanguageRulesChange(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { ChatMessage } from "@/lib/types"
import { generateAIResponse } from "@/lib/ai"
import { Send } from "lucide-react"

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseBrowserClient()

  // Fetch chat history on component mount
  useEffect(() => {
    async function fetchChatHistory() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(50)

        if (error) throw error

        setMessages(data || [])

        // If no messages, add a welcome message
        if (!data || data.length === 0) {
          const welcomeMessage = {
            id: "welcome",
            user_id: user.id,
            is_user: false,
            content: "Hi there! I'm Mindi, your mental health companion. How are you feeling today?",
            created_at: new Date().toISOString(),
          }
          setMessages([welcomeMessage])
          await supabase.from("chat_messages").insert(welcomeMessage)
        }
      } catch (error) {
        console.error("Error fetching chat history:", error)
      } finally {
        setInitialLoad(false)
      }
    }

    fetchChatHistory()
  }, [supabase])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Add user message to state and database
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        user_id: user.id,
        is_user: true,
        content: input,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")

      await supabase.from("chat_messages").insert(userMessage)

      // Generate AI response
      const aiResponse = await generateAIResponse(input)

      // Add AI response to state and database
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        user_id: user.id,
        is_user: false,
        content: aiResponse,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMessage])
      await supabase.from("chat_messages").insert(aiMessage)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoad) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <p>Loading chat...</p>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Mindi" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <span>Mindi</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.is_user ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.is_user ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

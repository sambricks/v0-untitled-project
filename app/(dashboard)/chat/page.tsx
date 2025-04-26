import ChatInterface from "@/components/chat-interface"

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chat with Mindi</h1>
      <p className="text-muted-foreground">
        Talk to your AI companion about how you're feeling or get support when you need it.
      </p>

      <div className="max-w-4xl mx-auto">
        <ChatInterface />
      </div>
    </div>
  )
}

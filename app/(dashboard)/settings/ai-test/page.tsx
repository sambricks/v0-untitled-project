import AITest from "@/components/ai-test"

export default function AITestPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Integration Test</h1>
      <p className="text-muted-foreground">
        Test the connection to the Groq AI service to ensure everything is working correctly.
      </p>

      <div className="max-w-2xl">
        <AITest />
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Home, MessageCircle, BookOpen, Music, BarChart, LogOut, Settings, Bug } from "lucide-react"

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/insights", label: "Insights", icon: BarChart },
    { href: "/music", label: "Music", icon: Music },
    { href: "/settings/ai-test", label: "AI Test", icon: Settings },
    { href: "/settings/debug", label: "Debug", icon: Bug },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Mindi</h1>
        <p className="text-sm text-muted-foreground">Your mental health companion</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>
      <div className="p-4">
        <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

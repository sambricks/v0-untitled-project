import type React from "react"
import NavBar from "@/components/nav-bar"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = getSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r bg-card hidden md:block">
        <NavBar />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="container py-6 md:py-8 max-w-6xl">{children}</div>
      </div>
    </div>
  )
}

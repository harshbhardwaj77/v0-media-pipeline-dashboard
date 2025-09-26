"use client"

import { useTheme } from "@/hooks/useTheme"
import { Dashboard } from "@/components/Dashboard"
import { Toaster } from "@/components/ui/toaster"

function App() {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen bg-background ${theme}`}>
      <Dashboard />
      <Toaster />
    </div>
  )
}

export default App

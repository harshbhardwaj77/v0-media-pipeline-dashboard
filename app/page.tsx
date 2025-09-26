"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/ThemeProvider"
import { AppHeader } from "@/components/AppHeader"
import { StatusPanel } from "@/components/panels/StatusPanel"
import { LinksPanel } from "@/components/panels/LinksPanel"
import { LogsPanel } from "@/components/panels/LogsPanel"

export default function Dashboard() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              if (error?.status >= 400 && error?.status < 500) return false
              return failureCount < 3
            },
            staleTime: 1000 * 30,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <AppHeader />
          <main className="container mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
              <div className="lg:col-span-1">
                <StatusPanel />
              </div>
              <div className="lg:col-span-1">
                <LinksPanel />
              </div>
              <div className="lg:col-span-1">
                <LogsPanel />
              </div>
            </div>
          </main>
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

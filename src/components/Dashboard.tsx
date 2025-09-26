import { AppHeader } from "./AppHeader"
import { StatusPanel } from "./panels/StatusPanel"
import { LinksPanel } from "./panels/LinksPanel"
import { LogsPanel } from "./panels/LogsPanel"

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto p-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Status & Controls Panel */}
          <div className="lg:col-span-4">
            <StatusPanel />
          </div>

          {/* Links Manager Panel */}
          <div className="lg:col-span-4">
            <LinksPanel />
          </div>

          {/* Live Logs Panel */}
          <div className="lg:col-span-4">
            <LogsPanel />
          </div>
        </div>
      </main>
    </div>
  )
}

import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App.tsx"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false
        return failureCount < 3
      },
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
})

// Ensure DOM is ready and root element exists
const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error('Failed to find the root element. Make sure there is a div with id="root" in your HTML.')
}

const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

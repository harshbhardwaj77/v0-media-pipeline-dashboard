import { Badge } from "@/components/ui/badge"
import type { Status } from "@/types/api"

interface StatusBadgesProps {
  status?: Status
}

export function StatusBadges({ status }: StatusBadgesProps) {
  if (!status) {
    return (
      <div className="flex gap-2">
        <Badge variant="outline">Pipeline: Unknown</Badge>
        <Badge variant="outline">VPN: Unknown</Badge>
        <Badge variant="outline">Tor: Unknown</Badge>
      </div>
    )
  }

  const getPipelineVariant = (state: string) => {
    switch (state) {
      case "running":
        return "success"
      case "stopped":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getConnectionVariant = (state: string) => {
    switch (state) {
      case "up":
        return "success"
      case "down":
        return "error"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <Badge variant={getPipelineVariant(status.pipeline)}>
        Pipeline: {status.pipeline.charAt(0).toUpperCase() + status.pipeline.slice(1)}
      </Badge>
      <Badge variant={getConnectionVariant(status.vpn)}>VPN: {status.vpn.toUpperCase()}</Badge>
      <Badge variant={getConnectionVariant(status.tor)}>Tor: {status.tor.toUpperCase()}</Badge>
    </div>
  )
}

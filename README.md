# Media Pipeline Dashboard

A modern React + TypeScript dashboard for monitoring and controlling a Dockerized media pipeline that downloads from MEGA.nz, processes files, and uploads to Gofile.io via Tor/VPN.

## Features

- **Real-time Status Monitoring**: Live pipeline, VPN, and Tor status with auto-refresh
- **Pipeline Control**: Start/stop pipeline with confirmation dialogs and error handling
- **Links Management**: Add single or bulk MEGA.nz URLs with validation and search
- **Live Log Streaming**: Real-time logs with filtering, search, and virtualized scrolling
- **Settings**: Configurable auto-scroll, polling intervals, and log buffer size
- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Keyboard Accessible**: Full keyboard navigation and screen reader support

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Tailwind CSS, Radix UI primitives
- **Data Fetching**: TanStack Query (React Query)
- **Real-time**: Server-Sent Events (SSE) with auto-reconnection
- **Virtualization**: TanStack Virtual for log performance
- **Deployment**: Docker with Nginx

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

The development server will start at `http://localhost:3000`.

### Environment Variables

Create a `.env` file in the root directory:

\`\`\`env
VITE_API_BASE=http://localhost:8081
\`\`\`

- `VITE_API_BASE`: Base URL for the pipeline API (default: http://localhost:8081)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Production Deployment

### Docker Build

\`\`\`bash
# Build the Docker image
docker build -t media-pipeline-web .

# Run the container
docker run -p 127.0.0.1:8080:80 media-pipeline-web
\`\`\`

### Docker Compose

\`\`\`bash
# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f media-pipeline-web

# Stop
docker-compose down
\`\`\`

The web interface will be available at `http://localhost:8080`.

### Configuration

The Docker container:
- Listens on `127.0.0.1:8080` (localhost only for security)
- Serves static files with optimized caching
- Includes security headers and gzip compression
- Runs as non-root user for security
- Includes health checks

## API Integration

The dashboard connects to a pipeline API running on `http://localhost:8081` with the following endpoints:

### Status Endpoints
- `GET /api/status` - Get current pipeline status
- `GET /api/status/stream` - SSE stream for status updates

### Pipeline Control
- `POST /api/pipeline/start` - Start the pipeline
- `POST /api/pipeline/stop` - Stop the pipeline

### Links Management
- `GET /api/links` - Get all links
- `POST /api/links` - Add single link
- `POST /api/links/bulk` - Add multiple links
- `DELETE /api/links/:id` - Delete link

### Logs
- `GET /api/logs/stream` - SSE stream for log entries

## Architecture

### Components Structure
\`\`\`
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── panels/          # Main dashboard panels
│   ├── Dashboard.tsx    # Main layout component
│   └── ...
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and API client
├── types/               # TypeScript type definitions
└── ...
\`\`\`

### Key Features

**Real-time Updates**: Uses Server-Sent Events for live status and log streaming with automatic reconnection and exponential backoff.

**Performance**: Virtualized log viewer handles thousands of entries efficiently, with configurable buffer limits.

**Error Handling**: Graceful degradation when API is unavailable, with retry mechanisms and user feedback.

**Accessibility**: Full keyboard navigation, screen reader support, and semantic HTML.

**Security**: Content Security Policy, secure headers, and non-root container execution.

## Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+

## License

MIT License - see LICENSE file for details.

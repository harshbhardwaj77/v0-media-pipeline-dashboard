#!/bin/bash

# Docker build script for media pipeline dashboard

set -e

IMAGE_NAME="media-pipeline-web"
TAG=${1:-latest}
FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"

echo "🐳 Building Docker image: $FULL_IMAGE_NAME"

# Build the Docker image
docker build -t "$FULL_IMAGE_NAME" .

echo "✅ Docker image built successfully: $FULL_IMAGE_NAME"
echo ""
echo "Next steps:"
echo "  • Run the container: docker run -p 127.0.0.1:8080:80 $FULL_IMAGE_NAME"
echo "  • Or use docker-compose: docker-compose up -d"
echo "  • Access the dashboard at: http://localhost:8080"
echo ""
echo "Environment variables:"
echo "  • VITE_API_BASE: Set the API base URL (default: http://localhost:8081)"

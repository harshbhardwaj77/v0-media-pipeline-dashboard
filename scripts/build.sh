#!/bin/bash

# Build script for media pipeline dashboard

set -e

echo "🏗️  Building Media Pipeline Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Built files are in the 'dist' directory"
echo ""
echo "Next steps:"
echo "  • Test the build: npm run preview"
echo "  • Deploy with Docker: docker build -t media-pipeline-web ."
echo "  • Or serve the 'dist' directory with any static file server"

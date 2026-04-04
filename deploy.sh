#!/bin/bash
set -e

echo "=== Zero Day Deployment Script ==="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is required for deployment"
    exit 1
fi

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build and start services
echo "Starting services..."
docker compose up -d --build

echo "Waiting for services to be ready..."
sleep 10

# Check health
echo "Checking health..."
curl -f http://localhost:8000/api/v1/health || echo "Health check failed"

echo "=== Deployment complete ==="
echo "Access the application at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"

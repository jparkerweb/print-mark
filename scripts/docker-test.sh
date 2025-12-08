#!/bin/bash
# Docker build and test script for print-mark

set -e

IMAGE_NAME="print-mark"
IMAGE_TAG="test"
CONTAINER_NAME="print-mark-test"
PORT=3000

echo "=== print-mark Docker Test Script ==="
echo ""

# Clean up any existing test container
echo "Cleaning up any existing test containers..."
docker rm -f $CONTAINER_NAME 2>/dev/null || true

# Build the image
echo ""
echo "Building Docker image..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .

# Check image size
echo ""
echo "Checking image size..."
IMAGE_SIZE=$(docker images $IMAGE_NAME:$IMAGE_TAG --format "{{.Size}}")
echo "Image size: $IMAGE_SIZE"

# Run the container
echo ""
echo "Starting container..."
docker run -d -p $PORT:3000 --name $CONTAINER_NAME $IMAGE_NAME:$IMAGE_TAG

# Wait for container to be healthy
echo ""
echo "Waiting for container to become healthy..."
for i in {1..30}; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "starting")
    if [ "$STATUS" = "healthy" ]; then
        echo "Container is healthy!"
        break
    fi
    if [ "$STATUS" = "unhealthy" ]; then
        echo "Container is unhealthy!"
        docker logs $CONTAINER_NAME
        exit 1
    fi
    echo "  Status: $STATUS (attempt $i/30)"
    sleep 2
done

# Test health endpoint
echo ""
echo "Testing /api/health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:$PORT/api/health)
echo "Response: $HEALTH_RESPONSE"

# Test themes endpoint
echo ""
echo "Testing /api/themes endpoint..."
THEMES_RESPONSE=$(curl -s http://localhost:$PORT/api/themes)
echo "Response: $THEMES_RESPONSE"

# Test PDF generation
echo ""
echo "Testing PDF generation..."
PDF_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/test.pdf \
    -X POST http://localhost:$PORT/api/pdf \
    -H "Content-Type: application/json" \
    -d '{"markdown": "# Test\n\nHello World", "theme": "modern-light", "options": {"pageSize": "A4", "margins": "normal", "includePageNumbers": true}}')
echo "PDF generation HTTP status: $PDF_RESPONSE"

if [ -f /tmp/test.pdf ]; then
    PDF_SIZE=$(ls -lh /tmp/test.pdf | awk '{print $5}')
    echo "PDF file created: $PDF_SIZE"
    rm /tmp/test.pdf
fi

# Show container logs
echo ""
echo "Container logs:"
docker logs $CONTAINER_NAME --tail 20

# Clean up
echo ""
echo "Cleaning up..."
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

echo ""
echo "=== Docker test complete ==="

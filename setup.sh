#!/bin/bash

# Match-3 Telegram Mini App Setup Script

echo "Setting up Match-3 Telegram Mini App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js before continuing."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "Node.js version must be 18 or higher. Current version: $NODE_VERSION"
    exit 1
fi

echo "Node.js version: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm before continuing."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")"

echo "Installing dependencies for root package..."
npm install

echo "Installing dependencies for client package..."
cd packages/client
npm install

echo "Installing dependencies for server package..."
cd ../server
npm install

echo "Installation complete!"
echo ""
echo "To start the development server, run:"
echo "  cd $(dirname "$0") && npm run dev"
echo ""
echo "To start only the client, run:"
echo "  cd $(dirname "$0")/packages/client && npm run dev"
echo ""
echo "To start only the server, run:"
echo "  cd $(dirname "$0")/packages/server && npm run dev"
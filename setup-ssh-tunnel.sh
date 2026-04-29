#!/bin/bash

# SSH Tunnel Setup Script for Hima Application
# This creates a secure tunnel to access the app via localhost

echo "================================"
echo "SSH Tunnel Setup"
echo "================================"
echo ""

# Check if ssh is available
if ! command -v ssh &> /dev/null; then
    echo "❌ SSH is not installed. Please install it first."
    exit 1
fi

# Get current machine IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "📍 Public IP: $PUBLIC_IP"
echo "🌐 App URL: http://$PUBLIC_IP:5173"
echo ""

# Create SSH tunnel to local port 3000
echo "🚀 Setting up SSH tunnel..."
echo "   Local: http://localhost:3000 → Remote: $PUBLIC_IP:5173"
echo ""

# SSH tunnel command (using -N for no remote shell, -f for background)
ssh -N -f -L 3000:$PUBLIC_IP:5173 localhost

echo "✅ Tunnel established!"
echo ""
echo "📱 Access the application at: http://localhost:3000"
echo ""
echo "To stop the tunnel, run: pkill -f 'ssh.*-N.*-L 3000'"
echo ""
echo "================================"
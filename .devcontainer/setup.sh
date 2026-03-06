#!/bin/bash
echo "========================================="
echo "  Setting up Zentra Development Environment"
echo "========================================="

# Install GnuCOBOL
echo "→ Installing GnuCOBOL..."
sudo apt-get update -q
sudo apt-get install -y gnucobol

# Verify GnuCOBOL install
echo "→ GnuCOBOL version:"
cobc --version | head -1

# Install Python dependencies
echo "→ Installing Python dependencies..."
pip install fastapi uvicorn pydantic python-multipart --quiet

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

# Create output directories
mkdir -p data/output data/test

echo ""
echo "✅ Zentra environment ready!"
echo "   • GnuCOBOL: $(cobc --version | head -1)"
echo "   • Python:   $(python --version)"
echo "   • Node:     $(node --version)"
echo ""
echo "Run your first COBOL program:"
echo "   bash scripts/run.sh src/cobol/core/HELLO.cbl"

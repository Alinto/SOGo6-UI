#!/usr/bin/env bash
# WebSocket Integration - Installation & Setup Script
# This script helps verify and setup the WebSocket integration

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   WebSocket RTK Redux Integration - Setup Helper         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if websocket directory exists
if [ ! -d "src/lib/redux/websocket" ]; then
    echo "❌ WebSocket directory not found!"
    exit 1
fi

echo "✅ WebSocket directory found"
echo ""

# Check all required files
echo "📋 Checking required files..."
echo ""

required_files=(
    "src/lib/redux/websocket/index.ts"
    "src/lib/redux/websocket/types.ts"
    "src/lib/redux/websocket/websocket-service.ts"
    "src/lib/redux/websocket/websocket-slice.ts"
    "src/lib/redux/websocket/websocket-middleware.ts"
    "src/lib/redux/websocket/websocket-hooks.ts"
    "src/lib/redux/websocket/README.md"
    "src/lib/redux/websocket/SETUP.md"
    "src/lib/redux/websocket/QUICK_REFERENCE.md"
)

all_found=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        # Count lines in file
        lines=$(wc -l < "$file")
        printf "  ✅ %-50s (%d lines)\n" "$file" "$lines"
    else
        printf "  ❌ %-50s (MISSING)\n" "$file"
        all_found=false
    fi
done

echo ""

if [ "$all_found" = false ]; then
    echo "❌ Some files are missing!"
    exit 1
fi

echo "✅ All files found!"
echo ""

# File statistics
echo "📊 File Statistics"
echo ""
total_lines=0
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        total_lines=$((total_lines + lines))
    fi
done

echo "   Total lines of code: $total_lines"
echo "   Number of files: ${#required_files[@]}"
echo ""

# Next steps
echo "🚀 Next Steps:"
echo ""
echo "  1. Review QUICK_REFERENCE.md for quick start"
echo "     $ cat src/lib/redux/websocket/QUICK_REFERENCE.md"
echo ""
echo "  2. Follow SETUP.md for integration"
echo "     $ cat src/lib/redux/websocket/SETUP.md"
echo ""
echo "  3. Check README.md for full API documentation"
echo "     $ cat src/lib/redux/websocket/README.md"
echo ""
echo "  4. Update your Redux store:"
echo "     - Import: import webSocketReducer from '@/lib/redux/websocket'"
echo "     - Add reducer: websocket: webSocketReducer"
echo ""
echo "  5. Initialize in your app root:"
echo "     - Import: initializeWebSocketMiddleware"
echo "     - Call with config: url, reconnectAttempts, etc."
echo ""
echo "  6. Start using in components:"
echo "     - useAutoConnectWebSocket()"
echo "     - useWebSocketSubscription('type', callback)"
echo "     - useWebSocketMessage()"
echo ""

echo "📚 Documentation Files:"
echo ""
echo "   QUICK_REFERENCE.md    - Quick lookup guide"
echo "   SETUP.md              - Step-by-step setup"
echo "   README.md             - Full API documentation"
echo "   INTEGRATION_SUMMARY.md - Feature overview"
echo "   examples.ts           - Code examples"
echo ""

echo "✨ Configuration needed in .env.local:"
echo ""
echo "   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws"
echo ""

echo "✅ Setup verification complete!"
echo ""
echo "For more info, see: src/lib/redux/websocket/README.md"
echo ""

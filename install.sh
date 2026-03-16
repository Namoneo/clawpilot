#!/bin/bash

# ClawPilot Installer Script
# Usage: curl -sL https://raw.githubusercontent.com/Namoneo/clawpilot/main/install.sh | bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
CLAWPILOT_VERSION="1.0.0"
CLAWPILOT_DIR="$HOME/.clawpilot"
API_URL="${CLAWPILOT_API_URL:-http://localhost:3000}"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      ClawPilot Installer v$CLAWPILOT_VERSION       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    else
        echo "unsupported"
    fi
}

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check for curl
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}Error: curl is required but not installed.${NC}"
        exit 1
    fi
    
    # Check for git
    if ! command -v git &> /dev/null; then
        echo -e "${RED}Error: git is required but not installed.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Prerequisites OK${NC}"
}

# Install Node.js
install_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        echo -e "${GREEN}✓ Node.js $NODE_VERSION already installed${NC}"
        return
    fi
    
    echo -e "${YELLOW}Installing Node.js...${NC}"
    
    OS=$(detect_os)
    
    if [[ "$OS" == "macos" ]]; then
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo -e "${RED}Homebrew not found. Install from https://brew.sh${NC}"
            exit 1
        fi
    elif [[ "$OS" == "linux" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    echo -e "${GREEN}✓ Node.js installed${NC}"
}

# Install OpenClaw
install_openclaw() {
    if command -v openclaw &> /dev/null; then
        echo -e "${GREEN}✓ OpenClaw already installed${NC}"
        return
    fi
    
    echo -e "${YELLOW}Installing OpenClaw...${NC}"
    
    # Install via npm
    npm install -g openclaw
    
    # Initialize OpenClaw
    openclaw init
    
    echo -e "${GREEN}✓ OpenClaw installed${NC}"
}

# Create configuration
create_config() {
    echo -e "${YELLOW}Creating configuration...${NC}"
    
    mkdir -p "$CLAWPILOT_DIR"
    
    cat > "$CLAWPILOT_DIR/config.json" <<EOF
{
  "api_url": "$API_URL",
  "log_level": "info",
  "auto_start": true,
  "models": {
    "planning": "openrouter/anthropic/claude-3.5-sonnet",
    "coding": "ollama/deepseek-coder-v2:latest",
    "review": "openrouter/anthropic/claude-3.5-sonnet"
  }
}
EOF
    
    echo -e "${GREEN}✓ Configuration created at $CLAWPILOT_DIR/config.json${NC}"
}

# Setup autostart
setup_autostart() {
    echo -e "${YELLOW}Setting up autostart...${NC}"
    
    OS=$(detect_os)
    
    if [[ "$OS" == "macos" ]]; then
        mkdir -p "$HOME/Library/LaunchAgents"
        cat > "$HOME/Library/LaunchAgents/com.clawpilot.agent.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.clawpilot.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>$HOME/.clawpilot/bin/agent</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOF
    elif [[ "$OS" == "linux" ]]; then
        # Systemd
        sudo cp infra/clawpilot.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable clawpilot
    fi
    
    echo -e "${GREEN}✓ Autostart configured${NC}"
}

# Main installation
main() {
    echo ""
    echo -e "${BLUE}Starting installation...${NC}"
    echo ""
    
    check_prerequisites
    install_node
    install_openclaw
    create_config
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     Installation Complete! 🎉          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Configure your API URL in $CLAWPILOT_DIR/config.json"
    echo "  2. Set up your model providers (OpenRouter, Ollama)"
    echo "  3. Run: clawpilot connect"
    echo ""
    echo "Documentation: https://github.com/Namoneo/clawpilot"
    echo ""
}

# Run
main

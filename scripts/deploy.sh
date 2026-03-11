#!/bin/bash
set -e

echo "🚀 Puerto Rico Game - Full Deployment Script"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for required tools
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ $1 found${NC}"
    return 0
}

echo -e "${BLUE}Checking prerequisites...${NC}"
check_command node || exit 1
check_command npm || exit 1
check_command wrangler || { echo -e "${YELLOW}⚠️ wrangler not found, will install${NC}"; npm install -g wrangler; }

# ============================================
# Deploy Frontend
# ============================================
deploy_frontend() {
    echo -e "\n${YELLOW}📦 Building Frontend...${NC}"
    cd frontend
    npm install
    npm run build
    
    echo -e "\n${YELLOW}☁️  Deploying to Cloudflare Pages...${NC}"
    wrangler pages deploy dist --project-name=puerto-rico-game
    
    cd ..
    echo -e "${GREEN}✅ Frontend deployed!${NC}"
}

# ============================================
# Deploy Backend (workers)
# ============================================
deploy_backend() {
    echo -e "\n${YELLOW}📦 Building Backend...${NC}"
    cd backend
    npm install
    npm run build
    
    echo -e "\n${YELLOW}☁️  Deploying Workers...${NC}"
    wrangler deploy
    
    cd ..
    echo -e "${GREEN}✅ Backend deployed!${NC}"
}

# ============================================
# Full Deployment
# ============================================
deploy_all() {
    echo -e "\n${BLUE}🚀 Starting Full Deployment${NC}\n"
    
    deploy_frontend
    deploy_backend
    
    echo -e "\n${GREEN}=============================================="
    echo -e "🎉 Deployment Complete!"
    echo -e "==============================================${NC}"
    echo -e "\n${BLUE}URLs:${NC}"
    echo -e "  Frontend: https://puerto-rico-game.pages.dev"
    echo -e "  Backend:  Check your Cloudflare dashboard"
}

# Menu
echo ""
echo "What would you like to deploy?"
echo "1) Frontend only (Cloudflare Pages)"
echo "2) Backend only (Cloudflare Workers)"
echo "3) Everything"
echo "4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1) deploy_frontend ;;
    2) deploy_backend ;;
    3) deploy_all ;;
    4) echo "Exiting..." && exit 0 ;;
    *) echo "Invalid choice" && exit 1 ;;
esac
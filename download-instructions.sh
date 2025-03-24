#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Pi Network Ludo - Download and Update Script${NC}\n"

# Function to check if git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        echo -e "${RED}Error: Git is not installed.${NC}"
        echo "Please install Git first:"
        echo "  - For Ubuntu/Debian: sudo apt-get install git"
        echo "  - For macOS: brew install git"
        echo "  - For Windows: Download from https://git-scm.com/download/win"
        exit 1
    fi
}

# Function to clone or update repository
update_repo() {
    local repo_url="https://github.com/hitcaff/Pi-Network-Ludo.git"
    
    if [ -d "Pi-Network-Ludo" ]; then
        echo -e "${BLUE}Updating existing repository...${NC}"
        cd Pi-Network-Ludo
        git pull origin main
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Repository successfully updated!${NC}"
        else
            echo -e "${RED}Error updating repository. Please check your internet connection and try again.${NC}"
            exit 1
        fi
    else
        echo -e "${BLUE}Cloning repository...${NC}"
        git clone "$repo_url"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Repository successfully cloned!${NC}"
        else
            echo -e "${RED}Error cloning repository. Please check your internet connection and try again.${NC}"
            exit 1
        fi
    fi
}

# Main script
echo "This script will download or update the Pi Network Ludo game."
echo -e "Current directory: ${BLUE}$(pwd)${NC}\n"

# Check if git is installed
check_git

# Prompt user for confirmation
read -p "Do you want to proceed? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    update_repo
    
    echo -e "\n${GREEN}Setup completed!${NC}"
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Navigate to the project directory: cd Pi-Network-Ludo"
    echo "2. Open index.html in your web browser"
    echo "3. Make sure to use Pi Browser for full functionality"
    echo -e "\n${BLUE}For updates:${NC}"
    echo "1. Run this script again to get the latest changes"
    echo "2. Check updates/README.md for new features and changes"
else
    echo -e "\n${RED}Operation cancelled by user.${NC}"
fi
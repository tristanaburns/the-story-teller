#!/bin/bash

# Initialize The Story Teller Project
# This script initializes the GitHub repository and sets up the Next.js application

# Exit on first error
set -e

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print with colors
print_green() {
  echo -e "${GREEN}$1${NC}"
}

print_yellow() {
  echo -e "${YELLOW}$1${NC}"
}

print_red() {
  echo -e "${RED}$1${NC}"
}

print_cyan() {
  echo -e "${CYAN}$1${NC}"
}

# Start script execution
clear
print_cyan "============================================="
print_cyan "  Initializing The Story Teller Project      "
print_cyan "============================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
  print_red "Git is not installed. Please install Git before continuing."
  exit 1
else
  git_version=$(git --version)
  print_green "Git is installed: $git_version"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  print_red "NPM is not installed. Please install Node.js before continuing."
  exit 1
else
  npm_version=$(npm --version)
  print_green "NPM is installed: v$npm_version"
fi

# Initialize git repo if not already initialized
if [ ! -d .git ]; then
  print_yellow "Initializing Git repository..."
  git init
  print_green "Git repository initialized."
else
  print_yellow "Git repository already exists."
fi

# Create .gitignore if it doesn't exist or update it
print_yellow "Setting up .gitignore..."
cat > .gitignore << EOL
# Next.js build output
.next
out

# Node.js dependencies
node_modules
package-lock.json
yarn.lock
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel deployment files
.vercel

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE files
.idea
.vscode
*.sublime-project
*.sublime-workspace

# OS specific files
.DS_Store
Thumbs.db

# Original project gitignore
# This .gitignore is appropriate for repositories deployed to GitHub Pages
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
/vendor
Gemfile.lock
CONTENT/The Shadow Team Chronicles/VIDEOS/
CONTENT/The Shadow Team Chronicles/IMAGES/DRAFT/
EOL
print_green ".gitignore updated."

# Install npm dependencies
print_yellow "Installing npm dependencies..."
npm install next@15.3.1 react@19.1.0 react-dom@19.1.0 typescript@5.8.3 next-auth@4.24.11 mongodb@6.15.0 mongoose@8.13.2 tailwindcss@4.1.4 autoprefixer@10.4.16 postcss@8.5.3 eslint@9.25.0 eslint-config-next@15.3.1 marked@15.0.8 @auth/mongodb-adapter@3.9.0 swr@2.2.5 d3@7.8.5 react-flow-renderer@10.3.17
npm install -D @types/node@20.10.8 @types/react@19.1.0 @types/react-dom@19.1.0 @types/d3@7.4.3 jest@29.7.0 @testing-library/react@15.0.0 @testing-library/jest-dom@6.4.2 mongodb-memory-server@9.1.6 @playwright/test@1.42.1 ts-node@10.9.2 ts-jest@29.1.2
print_green "Dependencies installed successfully."

# Create .env.local from example if it doesn't exist
if [ ! -f .env.local ] && [ -f .env.local.example ]; then
  cp .env.local.example .env.local
  print_green ".env.local created from template. Please update with your actual credentials."
elif [ ! -f .env.local ]; then
  print_yellow "Could not create .env.local automatically. Please create it manually."
fi

# Initial git commit
print_yellow "Creating initial git commit..."
git add .
git commit -m "Initial commit: Next.js app setup for The Story Teller"
print_green "Initial commit created."

# Instructions for GitHub remote setup
print_cyan "============================================="
print_cyan "Project initialized successfully!"
print_cyan "============================================="
print_yellow "To connect to a GitHub repository, run the following commands:"
echo "  git remote add origin https://github.com/yourusername/your-repo-name.git"
echo "  git push -u origin main"
echo ""
print_yellow "To start the development server:"
echo "  npm run dev"
echo ""
print_yellow "Don't forget to update .env.local with your credentials!"
print_cyan "============================================="

# Make script executable
chmod +x init-project.sh

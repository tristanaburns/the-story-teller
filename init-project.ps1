# Initialize The Story Teller Project
# This script initializes the GitHub repository and sets up the Next.js application

# Stop on first error
$ErrorActionPreference = "Stop"

# Output with colors for better visibility
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Start script execution
Clear-Host
Write-ColorOutput Green "============================================="
Write-ColorOutput Green "  Initializing The Story Teller Project      "
Write-ColorOutput Green "============================================="

# Check if git is installed
try {
    $gitVersion = git --version
    Write-ColorOutput Green "Git is installed: $gitVersion"
}
catch {
    Write-ColorOutput Red "Git is not installed or not in PATH. Please install Git before continuing."
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-ColorOutput Green "NPM is installed: v$npmVersion"
}
catch {
    Write-ColorOutput Red "NPM is not installed or not in PATH. Please install Node.js before continuing."
    exit 1
}

# Initialize git repo if not already initialized
if (-not (Test-Path -Path ".git")) {
    Write-ColorOutput Yellow "Initializing Git repository..."
    git init
    Write-ColorOutput Green "Git repository initialized."
} else {
    Write-ColorOutput Yellow "Git repository already exists."
}

# Create .gitignore if it doesn't exist or update it
Write-ColorOutput Yellow "Setting up .gitignore..."
$gitignoreContent = @"
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
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent
Write-ColorOutput Green ".gitignore updated."

# Install npm dependencies
Write-ColorOutput Yellow "Installing npm dependencies..."
try {
    npm install next@15.3.1 react@19.1.0 react-dom@19.1.0 typescript@5.8.3 next-auth@4.24.11 mongodb@6.15.0 mongoose@8.13.2 tailwindcss@4.1.4 autoprefixer@10.4.16 postcss@8.5.3 eslint@9.25.0 eslint-config-next@15.3.1 marked@15.0.8 @auth/mongodb-adapter@3.9.0 swr@2.2.5 d3@7.8.5 react-flow-renderer@10.3.17
    npm install -D @types/node@20.10.8 @types/react@19.1.0 @types/react-dom@19.1.0 @types/d3@7.4.3 jest@29.7.0 @testing-library/react@15.0.0 @testing-library/jest-dom@6.4.2 mongodb-memory-server@9.1.6 @playwright/test@1.42.1 ts-node@10.9.2 ts-jest@29.1.2
    Write-ColorOutput Green "Dependencies installed successfully."
} catch {
    Write-ColorOutput Red "Error installing dependencies: $_"
    exit 1
}

# Create .env.local from example if it doesn't exist
if (-not (Test-Path -Path ".env.local")) {
    Copy-Item -Path ".env.local.example" -Destination ".env.local" -ErrorAction SilentlyContinue
    if (Test-Path -Path ".env.local") {
        Write-ColorOutput Green ".env.local created from template. Please update with your actual credentials."
    } else {
        Write-ColorOutput Yellow "Could not create .env.local automatically. Please create it manually."
    }
}

# Initial git commit
Write-ColorOutput Yellow "Creating initial git commit..."
git add .
git commit -m "Initial commit: Next.js app setup for The Story Teller"
Write-ColorOutput Green "Initial commit created."

# Instructions for GitHub remote setup
Write-ColorOutput Cyan "============================================="
Write-ColorOutput Cyan "Project initialized successfully!"
Write-ColorOutput Cyan "============================================="
Write-ColorOutput White "To connect to a GitHub repository, run the following commands:"
Write-ColorOutput White "  git remote add origin https://github.com/yourusername/your-repo-name.git"
Write-ColorOutput White "  git push -u origin main"
Write-ColorOutput White ""
Write-ColorOutput White "To start the development server:"
Write-ColorOutput White "  npm run dev"
Write-ColorOutput White ""
Write-ColorOutput White "Don't forget to update .env.local with your credentials!"
Write-ColorOutput Cyan "============================================="

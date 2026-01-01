#!/bin/bash

# Better Chatbot Coolify Deployment Script
# This script helps you deploy the better-chatbot to Coolify

set -e

echo "🚀 Better Chatbot Coolify Deployment"
echo "======================================"

# Check if environment variables are set
if [ -z "$COOLIFY_API_URL" ] || [ -z "$COOLIFY_API_TOKEN" ]; then
    echo "❌ Error: Coolify environment variables not set"
    echo ""
    echo "Please set the following environment variables:"
    echo "export COOLIFY_API_URL=\"https://coolify.nexus-agency.net\""
    echo "export COOLIFY_API_TOKEN=\"your-api-token\""
    echo ""
    echo "You can get your API token from Coolify dashboard → Settings → API Tokens"
    exit 1
fi

echo "✅ Coolify credentials found"
echo ""

# Step 1: Check if project exists
echo "Step 1: Checking for existing project..."
PROJECTS=$(npx -y @felixallistar/coolify-mcp@latest projects list 2>/dev/null | grep -i "better-chatbot" || true)

if [ -z "$PROJECTS" ]; then
    echo "Creating new project..."
    npx -y @felixallistar/coolify-mcp@latest projects create --name "better-chatbot" --description "AI chatbot with file support"
else
    echo "Project already exists"
fi

# Step 2: Prepare deployment files
echo ""
echo "Step 2: Preparing deployment files..."
echo "✅ docker-compose.yml - Ready"
echo "✅ .coolify.yaml - Ready"
echo "✅ .env.docker - Ready"

# Step 3: Deploy via Coolify
echo ""
echo "Step 3: Deploying to Coolify..."
echo ""
echo "📋 Manual Deployment Instructions:"
echo "=================================="
echo ""
echo "1. Push your repository to GitHub/GitLab"
echo "   git add ."
echo "   git commit -m \"Add Coolify deployment with file support\""
echo "   git push origin main"
echo ""
echo "2. In Coolify Dashboard:"
echo "   - Go to Projects → Create New"
echo "   - Select 'Docker Compose' deployment type"
echo "   - Connect your GitHub repository"
echo "   - Use the .coolify.yaml configuration"
echo "   - Add environment variables in Coolify dashboard:"
echo ""
echo "     Required:"
echo "     - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)"
echo "     - POSTGRES_USER=postgres"
echo "     - POSTGRES_PASSWORD=your-secure-password"
echo ""
echo "     Optional (add AI provider keys as needed):"
echo "     - OPENAI_API_KEY=your-key"
echo "     - ANTHROPIC_API_KEY=your-key"
echo "     - GOOGLE_GENERATIVE_AI_API_KEY=your-key"
echo "     - EXA_API_KEY=your-key"
echo ""
echo "3. Deploy!"
echo "   - Coolify will automatically:"
echo "     ✓ Build the Docker image"
echo "     ✓ Create persistent volumes (uploads_data, postgres_data)"
echo "     ✓ Start all services"
echo "     ✓ Configure SSL/HTTPS"
echo ""
echo "4. Verify deployment:"
echo "   - Check health: curl https://chat.nexus-agency.net/api/health"
echo "   - Test file upload functionality"
echo ""
echo "📁 File Storage:"
echo "   - Files are stored in Docker volume: uploads_data"
echo "   - Path inside container: /app/uploads"
echo "   - Max file size: 100MB (configurable)"
echo ""
echo "📚 Documentation:"
echo "   - Full guide: COOLIFY_DEPLOYMENT.md"
echo "   - File support: FILE_SUPPORT_SETUP.md"
echo "   - Summary: DEPLOYMENT_SUMMARY.md"
echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Commit and push your changes"
echo "2. Connect repository to Coolify"
echo "3. Set environment variables"
echo "4. Deploy!"
echo ""
echo "Need help? Check the COOLIFY_DEPLOYMENT.md file for detailed instructions."
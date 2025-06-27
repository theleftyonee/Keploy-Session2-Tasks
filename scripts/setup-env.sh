#!/bin/bash

# StudentHub Dashboard Environment Setup Script
# This script helps you set up your environment variables

echo "🚀 StudentHub Dashboard Environment Setup"
echo "=========================================="

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Your existing .env.local file is preserved."
        exit 0
    fi
fi

# Copy the example file
if [ -f "env.example" ]; then
    cp env.example .env.local
    echo "✅ Created .env.local from env.example"
else
    echo "❌ env.example file not found!"
    exit 1
fi

echo ""
echo "📝 Next Steps:"
echo "1. Edit .env.local and add your Supabase credentials"
echo "2. Get your Supabase URL and anon key from:"
echo "   https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/settings/api"
echo ""
echo "🔧 Required variables to update:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "💡 Tip: You can use any text editor to modify .env.local"
echo "   Example: code .env.local (VS Code) or nano .env.local"
echo ""
echo "🎉 Environment setup complete!" 
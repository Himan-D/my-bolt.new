#!/bin/bash
# Deploy Supabase Edge Functions
# Usage: ./deploy-functions.sh

set -e

echo "Deploying Supabase Edge Functions..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Set project reference
export SUPABASE_PROJECT_REF=xkpeexoheupmvmyhiuyv

# Deploy functions
echo "Deploying handle-projects function..."
supabase functions deploy handle-projects

echo "Deploying handle-chat function..."
supabase functions deploy handle-chat

echo "✅ Edge Functions deployed successfully!"
echo ""
echo "Functions available at:"
echo "  - https://xkpeexoheupmvmyhiuyv.supabase.co/functions/v1/handle-projects"
echo "  - https://xkpeexoheupmvmyhiuyv.supabase.co/functions/v1/handle-chat"
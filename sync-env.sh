#!/bin/bash

# Script to sync environment variables from local .env to Vercel
# Usage: ./sync-env.sh [production|preview|development]

ENVIRONMENT=${1:-production}
PROJECT_URL="https://domovae.vercel.app"

echo "Syncing environment variables to Vercel ($ENVIRONMENT environment)..."

# Read .env file and sync each variable to Vercel
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ $key =~ ^[[:space:]]*# ]] || [[ -z $key ]]; then
        continue
    fi
    
    # Remove leading/trailing whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    # Handle special cases for production
    if [[ "$key" == "AUTH_URL" && "$ENVIRONMENT" == "production" ]]; then
        value="$PROJECT_URL"
        echo "Updating $key to production URL: $value"
    fi
    
    echo "Syncing $key..."
    
    # Remove existing variable first, then add new one
    vercel env rm "$key" "$ENVIRONMENT" 2>/dev/null || true
    echo "$value" | vercel env add "$key" "$ENVIRONMENT"
    
done < .env

echo "Environment variables synced successfully to $ENVIRONMENT!"
echo ""
echo "To deploy with these changes:"
echo "  vercel --prod"
echo ""
echo "To preview changes:"
echo "  vercel"

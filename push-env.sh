#!/bin/bash

# Script to push all local environment variables to Vercel
echo "Pushing environment variables to Vercel..."

# Read .env file and push each variable to Vercel
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ $key =~ ^[[:space:]]*# ]] || [[ -z $key ]]; then
        continue
    fi
    
    # Remove leading/trailing whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    echo "Adding $key..."
    echo "$value" | vercel env add "$key" production
done < .env

echo "Environment variables pushed successfully!"

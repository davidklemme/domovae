# Environment Variables Sync Guide

## Quick Commands

### 1. View current Vercel environment variables:

```bash
vercel env ls
```

### 2. Add a single environment variable to production:

```bash
echo "your-value" | vercel env add VARIABLE_NAME production
```

### 3. Update an existing environment variable:

```bash
# First remove the old one
vercel env rm VARIABLE_NAME production
# Then add the new one
echo "new-value" | vercel env add VARIABLE_NAME production
```

### 4. Sync all local variables to production (using our script):

```bash
./sync-env.sh production
```

### 5. Deploy with updated environment variables:

```bash
vercel --prod
```

## Key Variables to Update for Production

### AUTH_URL

- **Local**: `http://localhost:5173`
- **Production**: `https://domovae.vercel.app` (or your custom domain)

### OAuth Provider URLs

Make sure your Google and GitHub OAuth apps are configured with:

- **Authorized redirect URIs**: `https://domovae.vercel.app/api/auth/callback/google`
- **Authorized redirect URIs**: `https://domovae.vercel.app/api/auth/callback/github`

## Common Issues

1. **AUTH_URL mismatch**: If you get authentication errors, make sure AUTH_URL points to your production domain
2. **OAuth redirect errors**: Update your OAuth provider settings with the correct production URLs
3. **Database connection**: Your database variables should already be set up correctly

## Workflow

1. **Development**: Use local `.env` file
2. **Testing**: Use `vercel` (preview deployment)
3. **Production**: Use `vercel --prod` (production deployment)

## Script Usage

```bash
# Sync to production
./sync-env.sh production

# Sync to preview
./sync-env.sh preview

# Sync to development
./sync-env.sh development
```

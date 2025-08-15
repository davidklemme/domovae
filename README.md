# Domovae

A modern SvelteKit application with Neon database integration, ready for Vercel deployment.

## Features

- ⚡ **SvelteKit 2.0** - Latest SvelteKit with TypeScript
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🗄️ **Neon Database** - Serverless PostgreSQL with Drizzle ORM
- 🚀 **Vercel Ready** - Optimized for Vercel deployment
- 🧪 **Testing** - Vitest for unit testing, Playwright for E2E
- 📝 **Code Quality** - ESLint, Prettier, and TypeScript

## Prerequisites

- Node.js 20+ 
- pnpm 10+
- Neon database account

## Setup

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd domovae
   ```

2. **Install dependencies**
   ```sh
   pnpm install
   ```

3. **Environment Setup**
   ```sh
   cp env.example .env
   ```
   
   Update `.env` with your Neon database URL:
   ```
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   ```

4. **Database Setup**
   ```sh
   # Push schema to database
   pnpm db:push
   
   # Generate migrations
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   ```

## Development

```sh
# Start development server
pnpm dev

# Run tests
pnpm test

# Check types
pnpm check

# Format code
pnpm format

# Lint code
pnpm lint
```

## Database Commands

```sh
# Push schema changes
pnpm db:push

# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

## Deployment

This app is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set the `DATABASE_URL` environment variable in Vercel
3. Deploy!

The app uses `@sveltejs/adapter-auto` which automatically detects Vercel.

## Project Structure

```
src/
├── lib/
│   ├── server/
│   │   └── db/          # Database configuration
│   └── assets/          # Static assets
├── routes/              # SvelteKit routes
└── app.html             # HTML template
```

# Brickly

**Brickly** is a modern real estate platform designed to help property owners sell their houses and apartments in Germany. Built with cutting-edge web technologies, it provides an Airbnb-style listing experience with comprehensive property management tools.

## What is Brickly?

Brickly is a full-featured real estate marketplace that connects property sellers with potential buyers. The platform focuses on the German market and provides:

### 🏠 **For Property Owners**

- **Easy Property Management**: Create, edit, and manage property listings with a user-friendly interface
- **Rich Media Support**: Upload hero images, slideshow galleries, and layout/floor plan documents
- **Status Management**: Track properties through different stages (draft, published, live, in negotiation, archived)
- **Professional Listings**: Detailed property information including amenities, location details, and pricing

### 🔍 **For Property Buyers**

- **Airbnb-Style Browsing**: Beautiful, responsive property listings with rich media galleries
- **Advanced Filtering**: Search by location, price range, property type, and status
- **Detailed Property Views**: Comprehensive property information with image galleries and amenities
- **Contact Integration**: Easy communication with property owners (appointment booking coming soon)

### 🛡️ **Security & Trust**

- **Email Authentication**: Secure login via magic link authentication (no passwords)
- **Role-Based Access**: Different permissions for buyers and sellers
- **Data Protection**: GDPR-compliant data handling for the European market

## Key Features

- ⚡ **Modern Tech Stack** - SvelteKit 2.0 with TypeScript
- 🎨 **Beautiful UI** - Tailwind CSS with responsive design
- 🗄️ **Robust Database** - Neon PostgreSQL with Drizzle ORM
- 📱 **Mobile-First** - Optimized for all devices
- 🧪 **Quality Assured** - Comprehensive testing suite
- 🚀 **Production Ready** - Optimized for Vercel deployment
- 🔐 **Secure Authentication** - AuthJS with email magic links
- 📸 **Media Management** - Vercel Blob storage for images and documents

## Application Features

### 🏠 **Property Management**

- **Multi-step Property Creation**: Intuitive form wizard for creating detailed property listings
- **Rich Media Upload**: Support for hero images, slideshow galleries, and layout documents
- **Property Editing**: Full CRUD operations with draft saving and publishing
- **Status Tracking**: Manage properties through draft → published → live → in negotiation → archived

### 🔍 **Property Discovery**

- **Advanced Search**: Filter by location, price range, property type, and status
- **Responsive Grid Layout**: Beautiful Airbnb-style property cards
- **Detailed Property Views**: Comprehensive property information with image galleries
- **Owner Information**: Contact details and property ownership verification

### 👤 **User Management**

- **Email Authentication**: Secure login via magic link (no passwords required)
- **User Profiles**: Manage personal information and preferences
- **Role-Based Access**: Different permissions for buyers and sellers
- **Session Management**: Secure, persistent user sessions

### 🛠️ **Technical Features**

- **Real-time Updates**: Reactive UI with instant feedback
- **Mobile Responsive**: Optimized for all device sizes
- **Performance Optimized**: Fast loading with efficient data fetching
- **SEO Ready**: Meta tags and structured data for search engines

## Current Status

### ✅ **Completed Features**

- **Epic 1: Foundation & Authentication** - Complete user authentication system
- **Epic 2: Property Management** - Full property CRUD with media upload
- **Media Upload System** - Drag-and-drop file uploads with Vercel Blob
- **Property Listing Interface** - Airbnb-style browsing and filtering
- **User Dashboard** - Property management and overview

### 🚧 **In Development**

- **Epic 3: Appointment System** - Manual and calendar-based appointment booking
- **Epic 4: Applicant Vetting** - Rule engine for buyer verification
- **Epic 5: SEO & GDPR** - Search optimization and compliance features

### 📋 **Roadmap**

- **Calendar Integration** - Automated appointment scheduling
- **Advanced Search** - Map-based property discovery
- **Notifications** - Email and push notifications
- **Analytics** - Property view tracking and insights
- **Mobile App** - Native iOS and Android applications

## Prerequisites

- Node.js 20+
- pnpm 10+
- Neon database account

## Setup

1. **Clone the repository**

   ```sh
   git clone <your-repo-url>
   cd brickly
   ```

2. **Install dependencies**

   ```sh
   pnpm install
   ```

3. **Environment Setup**

   ```sh
   cp env.example .env
   ```

   Update `.env` with your configuration:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@hostname:port/database"

   # Authentication
   AUTH_SECRET="your-auth-secret-here"
   AUTH_URL="http://localhost:5174"

   # Email Provider (Resend)
   RESEND_API_KEY="your-resend-api-key"
   EMAIL_FROM="onboarding@resend.dev"

   # File Storage
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
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

## Tech Stack

### **Frontend**

- **SvelteKit 2.0** - Modern full-stack framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Svelte 5** - Latest reactive framework

### **Backend**

- **Neon Database** - Serverless PostgreSQL
- **Drizzle ORM** - Type-safe database queries
- **AuthJS** - Authentication and authorization
- **Vercel Blob** - File storage and CDN

### **Infrastructure**

- **Vercel** - Hosting and deployment
- **Resend** - Email delivery service
- **GitHub** - Version control and CI/CD

## Project Structure

```
src/
├── lib/
│   ├── components/      # Reusable Svelte components
│   ├── server/
│   │   ├── db/         # Database schema and configuration
│   │   ├── services/   # Business logic layer
│   │   └── auth.ts     # Authentication configuration
│   └── test/           # Test utilities and helpers
├── routes/
│   ├── api/            # API endpoints
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # User dashboard
│   ├── properties/     # Property management
│   └── profile/        # User profile management
└── app.html            # HTML template
```

## Contributing

This project follows a structured development approach:

1. **Epic-based Development** - Features are organized into epics
2. **Test-Driven Development** - All features include comprehensive tests
3. **Code Quality** - ESLint, Prettier, and TypeScript for consistency
4. **Git Hooks** - Pre-commit checks ensure code quality

## License

This project is proprietary software. All rights reserved.

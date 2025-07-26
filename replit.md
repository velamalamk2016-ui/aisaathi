# AI Saathi - Educational Platform

## Overview

AI Saathi is a comprehensive educational platform designed specifically for Indian classrooms. It provides AI-powered tools for teachers and students with multilingual support, focusing on Hindi, English, Tamil, Telugu, and Bengali languages. The platform offers specialized AI agents for different educational tasks including teaching aids generation, lesson planning, assessments, multilingual support, and administrative functions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Offline Support**: Local storage with sync capabilities

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (Active - Persistent Storage)
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Build Tool**: Vite for frontend, esbuild for backend
- **Development**: Hot module replacement with Vite middleware
- **Data Storage**: DatabaseStorage implementation with automatic seeding

### Design System
- **Component Library**: shadcn/ui with "new-york" style
- **Theme**: Neutral color scheme with CSS variables
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Icons**: Lucide React icons

## Key Components

### AI Agents
1. **Teaching Aids Agent** - Generates worksheets, flashcards, and stories using local resources
2. **Lesson Plan Agent** - Creates cross-grade activities with time-based adjustments
3. **Assessment Agent** - Conducts oral quizzes with immediate feedback
4. **Multilingual Agent** - Provides content translation across supported languages
5. **Admin Agent** - Manages attendance, progress tracking, and reports
6. **Storyteller Agent** - Creates educational stories with moral lessons

### Database Schema
- **Users**: Teacher accounts with role-based access
- **Students**: Student profiles with grade and language preferences
- **Lessons**: Educational content with subject categorization
- **Assessments**: Student evaluation records with scoring
- **Activities**: Generated content tracking
- **Resources**: Available teaching materials

### Core Features
- **Offline-First Design**: Local storage with sync capabilities
- **Multilingual Support**: 5 Indian languages with translation utilities
- **Responsive UI**: Mobile and desktop optimized
- **Real-time Updates**: Live data synchronization
- **Progress Tracking**: Student performance analytics

## Data Flow

1. **User Authentication**: Session-based authentication with role verification
2. **Content Generation**: AI agents process requests through Google Gemini API via Python service
3. **Data Persistence**: Drizzle ORM handles database operations
4. **Offline Sync**: Local storage caches data for offline access
5. **Real-time Updates**: Query invalidation triggers UI updates

## External Dependencies

### AI Services
- **Google Gemini API**: Gemini-1.5-flash model for content generation (converted from OpenAI)
- **Content Types**: Teaching aids, lesson plans, assessments, translations, stories

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: Environment variable-based configuration
- **Migration**: Drizzle Kit for schema management

### Authentication
- **Session Storage**: PostgreSQL-based session management
- **Security**: Environment variable-based secrets

### Development Tools
- **Replit Integration**: Development environment support
- **Error Handling**: Runtime error modal for development
- **Code Mapping**: Source map support for debugging

## Deployment Strategy

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Static Assets**: Served from Express static middleware

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable
- **Gemini**: `GEMINI_API_KEY` for AI services (Python FastAPI service)
- **Sessions**: Secure session configuration

### Deployment Process
1. Install dependencies (`npm install`)
2. Build frontend and backend (`npm run build`)
3. Start production server (`npm start`)
4. Database migrations handled via Drizzle Kit

### Development Workflow
- **Local Development**: `npm run dev` with hot reloading
- **Type Checking**: `npm run check` for TypeScript validation
- **Database**: `npm run db:push` for schema updates

The application follows a monorepo structure with shared types between frontend and backend, ensuring type safety across the entire stack. The architecture supports both online and offline usage patterns, making it suitable for varying connectivity conditions in Indian educational environments.
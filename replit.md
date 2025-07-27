# Habit Tracker Application

## Overview

This is a modern full-stack habit tracking application built with React, Express, and PostgreSQL. The application allows users to create, manage, and track their daily habits with comprehensive analytics and progress visualization. It features a clean, responsive design using shadcn/ui components and TailwindCSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and bundling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between client and server

### Database Schema
- **Database**: PostgreSQL (configured for Neon serverless)
- **Tables**:
  - `habits`: Stores habit definitions (id, name, category, frequency, createdAt)
  - `habit_completions`: Tracks daily completion status (id, habitId, date, completed, completedAt)
- **Schema Management**: Drizzle Kit for migrations and schema synchronization

## Key Components

### Frontend Components
1. **Layout Components**:
   - `MobileNav`: Bottom navigation for mobile devices
   - `RightSidebar`: Desktop sidebar with active/completed habit lists
   - `AddHabitModal`: Modal form for creating new habits

2. **Feature Components**:
   - `HabitCard`: Individual habit display with completion toggle
   - `AnalyticsDashboard`: Charts and statistics using Recharts
   - `CalendarView`: Monthly calendar showing completion patterns

3. **UI Components**: Comprehensive set of reusable components from shadcn/ui

### Backend Components
1. **Storage Layer**: 
   - `IStorage` interface defining data operations
   - `MemStorage` class implementing in-memory storage (fallback)
   - Drizzle ORM integration for PostgreSQL operations

2. **API Routes**:
   - `GET /api/habits`: Retrieve all habits with completion status
   - `POST /api/habits`: Create new habits
   - `POST /api/habits/:id/toggle`: Toggle habit completion
   - `GET /api/analytics`: Get aggregated statistics
   - `GET /api/completions`: Get completion data for date ranges

## Data Flow

1. **Habit Creation**: User submits form → validation → API call → database insert → cache invalidation
2. **Completion Tracking**: User clicks habit card → optimistic update → API call → database update → cache refresh
3. **Analytics**: Dashboard queries aggregated data → server calculates statistics → client renders charts
4. **Real-time Updates**: TanStack Query manages cache invalidation and background refetching

## External Dependencies

### Production Dependencies
- **Database**: `@neondatabase/serverless` for PostgreSQL connection
- **ORM**: `drizzle-orm` and `drizzle-zod` for database operations
- **UI**: Radix UI primitives and supporting libraries
- **Forms**: `react-hook-form` with `@hookform/resolvers`
- **Charts**: `recharts` for data visualization
- **Utilities**: `date-fns`, `clsx`, `class-variance-authority`

### Development Dependencies
- **Build**: Vite with React plugin
- **TypeScript**: Full TypeScript support across frontend/backend
- **Linting/Formatting**: ESBuild for production builds

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **Development**: Hot reload with Vite dev server
- **Production**: Static file serving with Express

### Deployment Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Apply database schema changes

The application is designed for deployment on platforms like Replit, Vercel, or similar Node.js hosting services with PostgreSQL database support.
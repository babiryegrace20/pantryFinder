# Food Pantry Finder

## Overview

Food Pantry Finder is a web application designed to connect individuals in need with local food pantries in St. Joseph County, Indiana. The platform provides real-time inventory tracking, enabling users to find pantries with specific food categories they need, while helping pantries reduce waste by advertising surplus items. The application emphasizes dignity-first design, accessibility, and mobile-first user experience.

**Key Features:**
- Real-time food pantry search by location and food category
- Inventory management system for pantry staff
- Request/pickup coordination between individuals and pantries
- Admin dashboard for system oversight and analytics
- WebSocket-based live updates for inventory changes

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- Component-based architecture using functional components and hooks

**UI Component Strategy:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system (New York variant) for pre-built components
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design principles adapted for social good applications

**State Management:**
- TanStack Query (React Query) for server state management and caching
- React Context API for authentication state (AuthContext)
- Local component state using React hooks (useState, useEffect)
- Custom hooks for reusable logic (use-mobile, use-toast)

**Design System:**
- Mobile-first responsive design (breakpoints at 768px, 1024px)
- WCAG 2.1 AA accessibility compliance mandatory
- Custom CSS variables for theming (light/dark mode support)
- Typography: Inter for UI, JetBrains Mono for data/addresses
- Minimum font size of 16px for body text to ensure readability

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server framework
- TypeScript for type safety across the stack
- RESTful API design with conventional route structure
- Custom session middleware (headers-based for development)

**Database Layer:**
- Drizzle ORM for type-safe database queries
- PostgreSQL as the primary database (via Neon serverless)
- Schema-first design with Zod validation
- Connection pooling via @neondatabase/serverless

**Real-time Communication:**
- Socket.IO for WebSocket-based real-time updates
- Room-based event distribution (pantry-specific channels)
- Live inventory updates broadcasted to connected clients

**Data Model:**
- **Users**: Support for three roles (individual, pantry-admin, admin)
- **Pantries**: Location data with lat/lon coordinates, operating hours, service areas
- **Inventory Items**: Category-based tracking with quantity, expiration dates, status
- **Requests**: Food assistance requests with status tracking
- **Addresses**: User address management with geocoding support

**API Design Pattern:**
- Storage abstraction layer (IStorage interface) for database operations
- Separation of concerns between routes, business logic, and data access
- Type-safe request/response handling with Zod schema validation

### Authentication & Authorization

**Current Implementation:**
- Simple header-based authentication (x-user-id, x-user-role)
- LocalStorage-based session persistence on client
- Role-based access control (individual, pantry-admin, admin)

**Security Considerations:**
- Production-ready session management required (connect-pg-simple available)
- Privacy-first design to preserve user dignity
- No authentication tokens exposed in repository

### Build & Deployment

**Development:**
- Concurrent client/server development with Vite HMR
- TypeScript strict mode enabled
- Path aliases configured (@/, @shared/, @assets/)

**Production Build:**
- Vite builds client to dist/public
- esbuild bundles server code to dist/
- Static file serving for production deployment
- Environment variable-based configuration (DATABASE_URL required)

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Primary data store with WebSocket support for edge deployments
- **Drizzle ORM**: Type-safe database queries with schema migrations in migrations/
- **Drizzle Kit**: Schema management and migration tooling

### UI Component Libraries
- **Radix UI**: 20+ accessible component primitives (dialog, dropdown, popover, etc.)
- **shadcn/ui**: Pre-built component system built on Radix
- **Lucide React**: Icon library for consistent iconography

### Styling & Design
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **tailwind-merge**: Intelligent class merging utility

### State Management & Data Fetching
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition

### Real-time & WebSockets
- **Socket.IO**: WebSocket library for client-server real-time communication
- **ws**: WebSocket client for Neon database connections in server environment

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across entire stack
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds

### Fonts
- **Google Fonts**: Inter (primary UI font) and JetBrains Mono (monospace)

### Future Integration Points
- Geocoding service for address-to-coordinates conversion (currently using placeholder lat/lon)
- Third-party delivery/volunteer driver integration
- Analytics platform for success metrics tracking
- Email/SMS notification service for request updates
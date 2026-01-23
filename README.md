# Corporate Agent Module - Frontend

A modern, responsive React/Next.js frontend for the eChanneling Corporate Agent booking system, designed for ABC Insurance Corporate Portal integration.

![Next.js](https://img.shields.io/badge/next.js-14+-black.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4+-blue.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)

## Overview

The frontend is a professional, enterprise-grade web application built with Next.js 14 and TypeScript. It provides corporate agents with an intuitive interface to manage healthcare appointments, track payments, generate reports, and coordinate with patients and healthcare providers.

**Key Characteristics:**
- **Modern UI/UX** - Clean, professional design with excellent user experience
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Integration** - Live data from backend APIs with proper error handling
- **Type Safety** - Full TypeScript implementation for reliable code
- **Performance Optimized** - Fast loading times and smooth interactions

## Features

### **Authentication & Security**
- Secure login/logout with JWT token management
- Role-based access control
- Automatic token refresh
- Protected routes and navigation

### **Dashboard**
- Real-time statistics display
- Recent appointments overview
- Performance metrics and KPIs
- Quick action buttons
- Responsive grid layout

### **Doctor Search & Booking**
- Advanced search with multiple filters
- Doctor profiles with ratings and fees
- Interactive appointment booking modal
- Time slot selection
- Instant booking confirmation

### **Appointment Management**
- Comprehensive appointment listing
- Status-based filtering (upcoming, completed, cancelled)
- Detailed appointment view
- Cancellation with reason tracking
- Real-time status updates

### **Bulk Booking System**
- CSV file upload and validation
- Manual entry interface
- Real-time data validation
- Progress tracking
- Error handling and feedback

### **ACB Confirmation Workflow**
- Pending appointments management
- Batch confirmation operations
- Detailed appointment review
- Status change notifications

### **Payment Tracking**
- Transaction history display
- Payment status monitoring
- Revenue analytics
- Invoice download functionality

### **Reports & Analytics**
- Interactive report generation
- Data visualization
- Export functionality
- Filtering and date range selection

### **Settings & Profile**
- Company profile management
- Password change functionality
- API key management
- User preferences

## Tech Stack

### **Core Framework**
- **Next.js 14** - React framework with App Router
- **React 18** - Component-based UI library
- **TypeScript 5.0+** - Type-safe JavaScript

### **Styling & UI**
- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful SVG icons
- **CSS Grid/Flexbox** - Modern layout systems

### **State Management & HTTP**
- **React Hooks** - Built-in state management
- **Fetch API** - Native HTTP client
- **React Context** - Global state when needed

### **Development Tools**
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking
- **Vercel** - Deployment and hosting

## Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Homepage (redirects to dashboard)
│   ├── globals.css              # Global styles
│   ├── login/                   # Authentication pages
│   ├── dashboard/               # Dashboard page
│   ├── doctors/                 # Doctor search & booking
│   ├── appointments/            # Appointment management
│   ├── bulk-booking/            # Bulk booking interface
│   ├── confirm-acb/             # ACB confirmation workflow
│   ├── payments/                # Payment tracking
│   ├── reports/                 # Analytics & reporting
│   └── settings/                # User settings & profile
├── components/                   # Reusable UI components
│   ├── layout/                  # Layout components
│   │   ├── dashboard-layout.tsx # Main dashboard layout
│   │   ├── header.tsx          # Navigation header
│   │   └── sidebar.tsx         # Navigation sidebar
│   └── ui/                     # Shadcn/ui components
├── hooks/                       # Custom React hooks
│   └── use-toast.ts            # Toast notification hook
├── lib/                         # Utility libraries
│   ├── api.ts                  # API client functions
│   ├── types.ts                # TypeScript type definitions
│   ├── utils.ts                # Utility functions
│   └── mock-data.ts            # Development mock data
├── public/                      # Static assets
├── .env.example                 # Environment variables template
└── package.json                 # Dependencies and scripts
```

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Backend API running (see backend README)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Configure environment variables
nano .env
```

### 3. Development Server
```bash
# Start development server
npm run dev

# Access application
open http://localhost:3000
```

### 4. Build for Production
```bash
# Create production build
npm run build

# Start production server
npm run start
```

## Environment Configuration

### `.env` Variables
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://dpdlab1.slt.lk:8645/corp-agent/api
NEXT_PUBLIC_APP_ENV=production

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_DEBUG_MODE=false

# Analytics (if needed)
NEXT_PUBLIC_GA_ID=your-ga-id
```

### Environment Modes
- **Development**: `npm run dev` - Hot reload, debug mode
- **Production**: `npm run build && npm run start` - Optimized build
- **Static Export**: `npm run build && npm run export` - Static files

## Pages & Components

### **Completed Pages**

#### 1. **Dashboard** (`/dashboard`)
**Features:**
- Real-time statistics cards (appointments, revenue, confirmations)
- Recent appointments list with quick actions
- Performance trend indicators
- Quick navigation buttons

**Components:**
- `DashboardLayout` - Main layout wrapper
- Statistics cards with dynamic data
- Recent appointments table
- Notification panel

#### 2. **Doctor Search** (`/doctors`)
**Features:**
- Advanced search with specialty/hospital filters
- Doctor profile cards with ratings and fees
- Interactive booking modal
- Time slot selection
- Instant booking confirmation

**Components:**
- Search and filter interface
- Doctor cards grid
- Booking dialog with form validation
- Time slot picker

#### 3. **Appointments** (`/appointments`)
**Features:**
- Tabbed interface (upcoming, completed, cancelled)
- Advanced filtering and search
- Appointment details modal
- Cancellation workflow
- Status management

**Components:**
- Filterable appointment list
- Status badges and indicators
- Details modal with patient info
- Cancellation dialog

#### 4. **Bulk Booking** (`/bulk-booking`)
**Features:**
- CSV file upload with validation
- Manual entry interface
- Real-time data validation
- Progress tracking
- Error reporting

**Components:**
- File upload interface
- Dynamic form rows
- Validation indicators
- Progress summary

#### 5. **Confirm ACB** (`/confirm-acb`)
**Features:**
- Pending appointments list
- Batch confirmation operations
- Detailed review interface
- Status change tracking

**Components:**
- Pending appointments grid
- Confirmation dialogs
- Batch action buttons
- Status indicators

#### 6. **Payments** (`/payments`)
**Features:**
- Transaction history table
- Payment status tracking
- Revenue analytics
- Invoice download

**Components:**
- Payment history table
- Status badges
- Analytics cards
- Export buttons

#### 7. **Reports** (`/reports`)
**Features:**
- Report type selection
- Date range picker
- Data visualization
- Export functionality

**Components:**
- Report type cards
- Date range selector
- Chart components
- Export interface

#### 8. **Settings** (`/settings`)
**Features:**
- Tabbed interface (Profile, Security, API Keys)
- Company information management
- Password change
- API key management

**Components:**
- Tabbed settings interface
- Form components
- Security features
- API key display

## API Integration

### API Client (`lib/api.ts`)
```typescript
export const api = {
  auth: {
    login: (email: string, password: string) => Promise<AuthResponse>
    logout: () => Promise<void>
  },
  dashboard: {
    getStats: () => Promise<DashboardStats>
  },
  doctors: {
    search: (filters: any) => Promise<Doctor[]>
    getById: (id: string) => Promise<Doctor>
  },
  appointments: {
    create: (data: any) => Promise<Appointment>
    bulkCreate: (data: any[]) => Promise<Appointment[]>
    getAll: (filters?: any) => Promise<Appointment[]>
    getUnpaid: () => Promise<Appointment[]>
    confirm: (id: string) => Promise<Appointment>
    cancel: (id: string, reason: string) => Promise<void>
  },
  payments: {
    getAll: () => Promise<Payment[]>
    // Note: Backend implementation needed
  },
  reports: {
    generate: (type: string, filters: any) => Promise<Report>
    // Note: Backend implementation needed
  }
}
```

### Error Handling
- Global error boundaries
- Toast notifications for API errors
- Fallback to mock data when API unavailable
- Retry mechanisms for failed requests

## UI/UX Design

### **Design System**
- **Color Palette**: Cyan/Blue gradient theme with professional grays
- **Typography**: Modern sans-serif with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle depth with tailwind shadow utilities

### **Component Library**
- **Shadcn/ui**: High-quality, accessible components
- **Custom Components**: Built on top of shadcn/ui for specific needs
- **Icons**: Lucide React for consistent iconography
- **Animations**: Smooth transitions and hover effects

### **Responsive Design**
- **Mobile First**: Designed for mobile, enhanced for desktop
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid and Flexbox for layouts
- **Touch Friendly**: Large touch targets on mobile

### **Accessibility**
- **WCAG 2.1 AA** compliance
- **Keyboard Navigation** support
- **Screen Reader** friendly
- **High Contrast** support

## Deployment

### **Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_BASE_URL
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Static Export**
```bash
# Generate static files
npm run build
npm run export

# Deploy to any static hosting
```

## Development & Testing

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## Customization

### **Theme Customization**
```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Customize primary colors
        }
      }
    }
  }
}
```

### **API Base URL**
```typescript
// lib/api.ts - Change API endpoint
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
```

## Implementation Status

### **Success Metrics**
- **100% UI/UX completion** for all required pages
- **Responsive design** works on all screen sizes
- **Type-safe codebase** with TypeScript
- **Modern development stack** with latest best practices
- **Production-ready** deployment configuration

## Contributing

### **Development Guidelines**
1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Implement proper error handling
4. Write meaningful component names
5. Add proper TypeScript types

### **Component Development**
```typescript
// Example component structure
interface ComponentProps {
  // Define props with TypeScript
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component implementation
  return <div>Component JSX</div>;
}
```

---

**Frontend Team**: React/Next.js Specialists
**Status**: Production Ready

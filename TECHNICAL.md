# Technical Documentation

## 💻 Technology Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **date-fns** for date manipulation

### Backend & Database
- **MongoDB** with Mongoose ODM
- **Next.js API Routes** for RESTful endpoints
- Type-safe APIs with proper error handling
- Indexed database queries for performance

### Design System
- Custom glassmorphism components
- CSS variable-based theming
- Responsive breakpoints
- Consistent color palette (blue, purple, pink accents)

## 🗂️ Application Structure

### Pages
- **`/events`** - Main events view (default) with monthly grouping
- **`/timelines`** - Timeline management and overview
- **`/timeline/[id]/view`** - Individual timeline visualization
- **`/timeline/[id]/edit`** - Timeline editing mode

### Core Components
- **Events** - Main journal entries view with monthly grouping
- **Timeline** - Visual timeline with drag-and-drop functionality
- **Calendar** - Interactive date picker in sidebar
- **EventModal** - Form for creating/editing events
- **EventCard** - Individual event display cards

### API Endpoints
- `GET/POST /api/events` - Event CRUD operations
- `GET/POST /api/timelines` - Timeline management
- `GET /api/events?timelineId=` - Timeline-specific events
- `GET /api/events?startDate=&endDate=` - Date range filtering

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up MongoDB:**
   - Create a MongoDB database
   - Add connection string to environment variables

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🛠️ Development

### Project Structure
```
journaline/
├── app/
│   ├── api/                 # API routes
│   ├── components/          # React components
│   ├── lib/                 # Utilities and services
│   │   ├── models/         # Database models
│   │   └── services/       # API services
│   ├── events/             # Events page
│   ├── timelines/          # Timeline management
│   └── timeline/[id]/      # Individual timeline views
├── public/                 # Static assets
└── docs/                   # Documentation
```

### Key Services
- **EventService**: Handles event CRUD operations
- **TimelineService**: Manages timeline operations
- **MongoDB**: Database connection and models
- **Hooks**: Custom React hooks for data fetching

### Technical Capabilities
- Real-time updates across components
- Optimistic UI updates
- Error boundaries and fallback states
- Keyboard navigation and accessibility support

## 🎨 Design System

Journaline features a comprehensive glassmorphism design system with:
- Consistent glass effects and transparency
- Adaptive color schemes for light/dark modes
- Responsive breakpoints and mobile-first design
- Accessibility-focused components
- Smooth animations and transitions

## 🔧 Architecture Details

### Database Schema
- **Events**: Title, description, date, timeline associations
- **Timelines**: Name, description, group positions, order
- **Relationships**: Many-to-many between events and timelines

### Performance Optimizations
- Indexed database queries
- Lazy loading of components
- Efficient re-rendering with React hooks
- Responsive images and assets

### Security & Error Handling
- Input validation and sanitization
- Proper error boundaries
- Graceful fallback states
- Type safety throughout the application 
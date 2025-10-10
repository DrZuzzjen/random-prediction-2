# Random Prediction Next.js App - Development Guide

## Project Overview

This Next.js application is a modern reimplementation of the Random Prediction game, transitioning from the original Streamlit version. The app features a sophisticated dial-based number selection interface and comprehensive analytics dashboard.

## Architecture

### Tech Stack
- **Framework**: Next.js 14.2.5 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS Modules + Global CSS
- **External API**: Random.org for number generation
- **Deployment**: Ready for Vercel/Netlify

### Project Structure
```
nextjs-app/
├── app/
│   ├── (pages)/           # Route groups for pages
│   │   ├── game/          # Main game interface
│   │   ├── analytics/     # Global analytics dashboard
│   │   └── my-analytics/  # Personal user analytics
│   ├── api/               # API routes (serverless functions)
│   │   ├── game-run/      # Save game results
│   │   ├── leaderboard/   # Fetch top scores
│   │   ├── random/        # Random.org integration
│   │   ├── global-analytics/ # Community insights
│   │   └── user-analytics/   # Personal stats
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── lib/
│   ├── analytics.ts      # Analytics utilities
│   ├── supabaseAdmin.ts  # Server-side Supabase client
│   ├── types.ts          # TypeScript type definitions
│   └── utils/
│       └── game.ts       # Game logic utilities
└── Configuration files...
```

## Key Features

### 🎯 Game Interface (`app/(pages)/game/`)
- **Dial-based Number Selection**: Interactive spinning wheel for number selection
- **10 Unique Numbers**: Players select exactly 10 numbers (1-100)
- **Real-time Validation**: Prevents duplicate selections
- **Random.org Integration**: Fetches truly random numbers for comparison
- **Score Calculation**: Matches between predictions and random numbers

### 📊 Analytics (`app/(pages)/analytics/`)
- **Number Heatmaps**: Visual representation of number selection frequency
- **Range Distribution**: Analysis of number range preferences
- **Community Insights**: Aggregate statistics across all players
- **Comparison Cards**: Statistical comparisons and trends

### 👤 Personal Analytics (`app/(pages)/my-analytics/`)
- **Individual Performance**: Personal game history and statistics
- **Email-based Lookup**: Retrieve personal stats using email
- **Progress Tracking**: Performance over time

### 🏆 Leaderboard
- **Top Performers**: Highest scoring games
- **Recent Activity**: Latest game submissions
- **Filterable Results**: Various sorting and filtering options

## Core Components

### NumberDial (`app/components/NumberDial.tsx`)
The centerpiece UI component featuring:
- Smooth spinning animation
- Number selection/deselection
- Visual feedback for selected numbers
- Responsive design for mobile/desktop

### Analytics Components
- **NumberHeatmap**: Visualizes number selection frequency
- **RangeDistribution**: Shows distribution patterns
- **StatCard**: Displays key metrics
- **ComparisonCard**: Side-by-side comparisons

## API Routes

### `/api/random`
- Integrates with Random.org API
- Fetches 10 random numbers (1-100)
- Handles API key authentication
- Error handling for rate limits

### `/api/game-run`
- Saves completed games to Supabase
- Calculates and stores score
- Validates data before insertion
- Returns saved game data

### `/api/leaderboard`
- Fetches top-scoring games
- Supports pagination
- Returns formatted leaderboard data

### `/api/global-analytics` & `/api/user-analytics`
- Provides statistical insights
- Aggregates data from multiple games
- Supports filtering by date ranges

## Database Schema

### `game_runs` Table
```sql
- id: UUID (primary key)
- created_at: timestamp
- user_name: string
- email: string
- predictions: number[] (JSON array)
- random_numbers: number[] (JSON array)
- score: integer
- game_type: string
```

## Environment Configuration

Required environment variables in `.env.local`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RANDOM_API_KEY=your_random_org_key
```

## Development Workflow

### Getting Started
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development server: `npm run dev`
4. Open http://localhost:3000

### Key Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Authentication Strategy

Currently using temporary localStorage-based identity management via `useSavedIdentity` hook. Future roadmap includes:
- Proper user authentication system
- User accounts and profiles
- Enhanced personal analytics
- Social features

## Performance Considerations

### Optimization Features
- **Server-Side Rendering**: Fast initial page loads
- **API Routes**: Efficient serverless functions
- **Component Optimization**: Proper React optimization patterns
- **Database Queries**: Optimized Supabase queries

### Caching Strategy
- Static generation for analytics pages where appropriate
- Client-side caching for user data
- Efficient re-fetching patterns

## Deployment Notes

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Error monitoring set up
- [ ] Performance monitoring enabled
- [ ] CORS policies configured

### Recommended Deployment Platforms
- **Vercel**: Seamless Next.js integration
- **Netlify**: Good alternative with edge functions
- **Railway/Render**: For full-stack deployments

## Common Development Tasks

### Adding New Analytics
1. Define data queries in `lib/analytics.ts`
2. Create API route in `app/api/`
3. Build UI components in `app/components/`
4. Integrate into analytics pages

### Modifying Game Logic
1. Update core logic in `lib/utils/game.ts`
2. Modify API handlers as needed
3. Update component behavior
4. Test thoroughly with various inputs

### Styling Updates
1. Global styles in `app/globals.css`
2. Component-specific styles as CSS modules
3. Responsive design considerations
4. Mobile-first approach

## Testing Strategy

### Areas to Focus
- Game logic accuracy
- API route functionality
- Database operations
- User interface interactions
- Mobile responsiveness

### Recommended Tools
- Jest for unit testing
- Cypress for E2E testing
- React Testing Library for component testing

## Migration Notes

This Next.js app replaces the original Streamlit version with:
- ✅ Improved user experience with dial interface
- ✅ Better performance and SEO
- ✅ Enhanced analytics capabilities
- ✅ Mobile-responsive design
- ✅ Modern development stack
- ✅ Scalable architecture

## Future Enhancements

### Planned Features
- User authentication system
- Advanced analytics dashboards
- Social sharing capabilities
- Game variations and modes
- Real-time multiplayer features
- Progressive Web App (PWA) support

### Technical Improvements
- Comprehensive testing suite
- Error boundary implementation
- Advanced caching strategies
- Performance monitoring
- Accessibility improvements

## Support & Maintenance

### Key Files to Monitor
- `app/api/` routes for backend logic
- `app/components/NumberDial.tsx` for core game interface
- `lib/analytics.ts` for data processing
- Database schema and migrations

### Common Issues
- Random.org API rate limits
- Supabase connection issues
- Mobile rendering problems
- Performance on older devices

---

**Note**: This is the production-ready Next.js implementation. The original Streamlit version in the parent directory is now deprecated in favor of this modern web application.
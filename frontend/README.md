# Frontend - Home Services Application

This is the React frontend for the Home Services application, providing customer, provider, and admin interfaces.

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible UI components
- **React Router** for navigation
- **Axios** for API communication
- **React Query** for data fetching and caching
- **Capacitor** for mobile app capabilities

## Features

### Customer Portal
- Browse and search services
- Book one-time and recurring services
- Manage bookings and payments
- Review and rating system
- Complaint management
- Real-time notifications

### Provider Portal
- Manage service offerings
- Accept and complete orders
- Track earnings and analytics
- Document management
- Availability scheduling

### Admin Dashboard
- User management
- System analytics and monitoring
- Payment management
- Complaint resolution
- Provider approval workflows

### Mobile Features
- Progressive Web App (PWA) capabilities
- Push notifications
- Camera integration for photo uploads
- Offline support
- Pull-to-refresh functionality

## Getting Started

### Prerequisites
- Node.js v20.11 or higher
- npm, yarn, or bun package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=https://localhost:44375/api
   VITE_AUTH_BASE_URL=https://localhost:44375
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   VITE_FIREBASE_CONFIG=your_firebase_config
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   │   ├── customer/       # Customer portal pages
│   │   ├── provider/       # Provider portal pages
│   │   └── admin/          # Admin dashboard pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── lib/                # Utility libraries
│   ├── contexts/           # React contexts
│   ├── types/              # TypeScript type definitions
│   └── locales/            # Internationalization files
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## API Integration

The frontend communicates with the backend through REST APIs. Key configuration files:

- `src/lib/api-client.ts` - Axios client configuration with authentication
- `src/services/api.ts` - API service functions organized by domain
- `src/types/api.ts` - TypeScript types for API responses

### Authentication
The app uses JWT tokens for authentication. Tokens are automatically included in API requests and refreshed when needed.

### Error Handling
Global error handling is implemented with automatic retry logic and user-friendly error messages.

## Mobile Development

### Capacitor Setup
The app is configured for mobile deployment using Capacitor:

```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Add mobile platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in native IDE
npx cap open ios
npx cap open android
```

### PWA Features
- Service worker for offline functionality
- App manifest for installation
- Push notification support
- Background sync capabilities

## Internationalization

The app supports multiple languages using react-i18next:

- Translation files are in `src/locales/`
- Add new languages by creating new locale files
- Use the `useTranslation` hook for translated text

## Performance Optimization

- Code splitting with React.lazy()
- Image optimization and lazy loading
- React Query for efficient data caching
- Bundle analysis with Vite

## Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Set environment variables for production:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_AUTH_BASE_URL` - Authentication server URL
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `VITE_FIREBASE_CONFIG` - Firebase configuration

### Static Hosting
The built files in `dist/` can be deployed to any static hosting service like Vercel, Netlify, or AWS S3.

## Contributing

1. Follow the existing code style and conventions
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Include responsive design for mobile devices
5. Add translations for new text content
6. Test on multiple devices and browsers

## License

This project contains code from multiple sources. Please refer to the original repositories for licensing information.

# Home Services Platform 🏠

A comprehensive home services marketplace built with React TypeScript frontend and ASP.NET Core backend, featuring **complete API integration** and production-ready deployment.

## ✅ Integration Status

**🎉 FULLY INTEGRATED** - All mock data has been replaced with real API calls!

- ✅ **Authentication & Authorization** - JWT-based security
- ✅ **Service Management** - Browse, search, and book services
- ✅ **Provider Management** - Complete provider lifecycle
- ✅ **Order Management** - Real-time order tracking
- ✅ **Payment Processing** - Secure payment integration
- ✅ **File Uploads** - Secure file handling with progress tracking
- ✅ **Calendar System** - Event management and scheduling
- ✅ **Testing Dashboard** - Live test execution and monitoring
- ✅ **Analytics & Reporting** - Real-time metrics and insights
- ✅ **Notifications** - Push notification system
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Loading States** - User-friendly loading indicators

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- .NET 8.0 SDK
- SQL Server (LocalDB or full instance)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd homeservices-platform
   ```

2. **Setup Backend**
   ```bash
   cd backend
   dotnet restore
   dotnet ef database update
   dotnet run --project src/HomeServicesApp.HttpApi.Host
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Configure Environment**
   ```bash
   # Copy and edit environment variables
   cp frontend/.env.example frontend/.env
   # Update API URLs to match your backend
   ```

### 🧪 Test the Integration

Open browser console and run:
```javascript
// Test API connectivity
await runAPITests();

// Full integration test
await runFullIntegrationTest();
```

## 📁 Project Structure

```
├── backend/                 # ASP.NET Core API
│   ├── src/
│   │   ├── HomeServicesApp.HttpApi.Host/    # Main API host
│   │   ├── HomeServicesApp.HttpApi/         # API controllers
│   │   ├── HomeServicesApp.Application/     # Business logic
│   │   └── HomeServicesApp.Domain/          # Domain models
│   └── test/               # Backend tests
├── frontend/               # React TypeScript SPA
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks with API integration
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Utility functions
│   ├── .env               # Environment configuration
│   └── dist/              # Build output
└── docs/                  # Documentation
```

## 🔧 Key Features

### Frontend Features
- **Modern React 18** with TypeScript and Vite
- **Responsive Design** with Tailwind CSS and shadcn/ui
- **Real-time Data** from integrated APIs
- **Optimized Performance** with caching and request deduplication
- **Progressive Web App** capabilities
- **Comprehensive Testing** utilities

### Backend Features
- **ASP.NET Core 8** with clean architecture
- **Entity Framework Core** with SQL Server
- **JWT Authentication** with role-based authorization
- **RESTful APIs** with OpenAPI/Swagger documentation
- **File Upload** with secure storage
- **Real-time Notifications** with Firebase integration

### Integration Features
- **Type-safe API calls** with automatic error handling
- **Request caching** and performance monitoring
- **Fallback mechanisms** for offline scenarios
- **Environment-based configuration** for different deployments
- **Comprehensive testing** tools and utilities

## 🛠 Development Tools

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
```

### Backend Development
```bash
dotnet run           # Start API server
dotnet test          # Run tests
dotnet ef migrations add <name>  # Add migration
dotnet ef database update       # Update database
```

### Integration Testing
```bash
# Browser console commands available:
runAPITests()                    # Test API connectivity
runFullIntegrationTest()         # Comprehensive integration test
performanceMonitor.getAllMetrics()  # Check API performance
apiCache.getStats()              # Check cache efficiency
```

## 📚 Documentation

### Application Documentation
- **[API Integration Complete](frontend/API_INTEGRATION_COMPLETE.md)** - Detailed integration documentation
- **[Integration Testing](frontend/src/utils/integration-test.ts)** - Testing utilities and examples

### Deployment Documentation
- 🚀 **[CI/CD Quick Start](CICD_QUICK_START.md)** - 30-minute setup guide
- 📋 **[CI/CD Setup Guide](CICD_SETUP_GUIDE.md)** - Complete CI/CD configuration
- 📘 **[Hostinger Deployment Guide](HOSTINGER_DEPLOYMENT_GUIDE.md)** - Comprehensive Hostinger guide
- 🏗️ **[Architecture](ARCHITECTURE.md)** - System architecture diagrams
- 📘 **[Frontend Deployment Guide](frontend/DEPLOYMENT_GUIDE.md)** - Additional options

## 🌐 API Endpoints

### Core Services
- `GET /api/service` - Browse services
- `GET /api/category` - Service categories
- `POST /api/order` - Create orders
- `GET /api/provider` - Provider management

### User Management
- `POST /api/auth/login` - User authentication
- `GET /api/userprofile` - User profile management
- `GET /api/notification` - Notifications

### Advanced Features
- `POST /api/upload` - File uploads
- `GET /api/calendar/events` - Calendar management
- `GET /api/testing/suites` - Testing dashboard
- `GET /api/analytics/dashboard` - Analytics

## 🔒 Security Features

- **JWT Authentication** with automatic token refresh
- **Role-based Authorization** (Customer, Provider, Admin)
- **CORS Configuration** for cross-origin requests
- **Input Validation** on all endpoints
- **Secure File Upload** with type validation
- **Rate Limiting** and request throttling

## 🚀 Production Deployment

The application is production-ready with automated CI/CD deployment to Hostinger VPS:

### Quick Hostinger Deployment

**Setup VPS (one-time):**
```bash
scp scripts/setup-vps.sh root@your-vps-ip:/root/
ssh root@your-vps-ip "bash /root/setup-vps.sh"
```

**Automated CI/CD with GitHub Actions:**
1. Configure GitHub Secrets (see [CICD_QUICK_START.md](CICD_QUICK_START.md))
2. Push to `main` branch - automatic deployment!

**Manual deployment:**
```bash
./scripts/deploy-to-hostinger.sh
```

### Deployment Features

- ✅ **Automated CI/CD** with GitHub Actions
- ✅ **Zero-downtime deployment** with automatic backups
- ✅ **Automatic rollback** on deployment failure
- ✅ **SSL/HTTPS** via Let's Encrypt (free)
- ✅ **Docker support** with alternative deployment option
- ✅ **Database migrations** automated
- ✅ **Health checks** after each deployment
- ✅ **Cost-effective** hosting ($10-20/month)
- ✅ **Production monitoring** and logging

### Deployment Guides

- 🚀 **[CI/CD Quick Start](CICD_QUICK_START.md)** - Get started in 30 minutes
- 📘 **[CI/CD Setup Guide](CICD_SETUP_GUIDE.md)** - Complete configuration guide
- 📘 **[Hostinger Deployment Guide](HOSTINGER_DEPLOYMENT_GUIDE.md)** - Full deployment documentation
- 📘 **[Frontend Deployment Guide](frontend/DEPLOYMENT_GUIDE.md)** - Additional deployment options

### Local Testing

Test the full stack locally before deploying:
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# API: http://localhost:8080
# Auth: http://localhost:8081
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Success Metrics

- ✅ **100% API Integration** - All mock data replaced
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Performance** - Optimized API calls with caching
- ✅ **User Experience** - Loading states and feedback
- ✅ **Production Ready** - Deployment and monitoring configured

---

**Ready for production deployment!** 🚀 The platform now features complete API integration with real-time data, comprehensive error handling, and production-ready deployment configurations.

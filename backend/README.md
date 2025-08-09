# Backend - Home Services Application

This is the .NET backend for the Home Services application, built with ABP Framework and providing comprehensive APIs for the home services platform.

## Technology Stack

- **.NET 9.0** with C#
- **ABP Framework** for modular architecture
- **Entity Framework Core** for data access
- **OpenIddict** for authentication and authorization
- **SQLite** database (configurable)
- **In-Memory Caching** for application caching
- **File-based distributed locking** for synchronization
- **AutoMapper** for object mapping
- **Swagger/OpenAPI** for API documentation

## Architecture

The solution follows Domain Driven Design (DDD) principles with a layered architecture:

### Core Projects

- **HomeServicesApp.Domain** - Domain entities, value objects, and business rules
- **HomeServicesApp.Domain.Shared** - Shared domain constants and enums
- **HomeServicesApp.Application** - Application services and business logic
- **HomeServicesApp.Application.Contracts** - DTOs and service interfaces
- **HomeServicesApp.EntityFrameworkCore** - Data access layer with EF Core
- **HomeServicesApp.HttpApi** - Web API controllers
- **HomeServicesApp.HttpApi.Host** - API hosting application
- **HomeServicesApp.AuthServer** - Authentication server with OpenIddict
- **HomeServicesApp.DbMigrator** - Database migration console application
- **HomeServicesApp.HttpApi.Client** - HTTP client for API consumption

### Test Projects

- **HomeServicesApp.TestBase** - Base classes for testing
- **HomeServicesApp.Domain.Tests** - Domain layer unit tests
- **HomeServicesApp.Application.Tests** - Application layer unit tests
- **HomeServicesApp.EntityFrameworkCore.Tests** - Data layer integration tests
- **HomeServicesApp.HttpApi.Client.ConsoleTestApp** - Console test application

## Key Features

### Business Services
- **Analytics** - Dashboard analytics, user metrics, and revenue reporting
- **Orders** - Order lifecycle management, coupon processing, recurring bookings
- **Providers** - Provider registration, approval workflows, document management
- **Payments** - Payment processing, refunds, and payment method management
- **Reviews** - Customer review system with ratings
- **Complaints** - Customer complaint management with admin workflows
- **Notifications** - Push notification delivery via Firebase
- **Monitoring** - System health checks and performance metrics

### Authentication & Security
- OpenIddict-based authentication with Google OAuth integration
- Role-based authorization (Customer, Provider, Admin)
- JWT token-based API authentication
- CORS configuration for frontend integration

### Data Management
- Entity Framework Core with SQLite database
- Repository pattern implementation
- Database migrations and seeding
- Multi-tenancy support via ABP Framework

## Prerequisites

- [.NET 9.0+ SDK](https://dotnet.microsoft.com/download/dotnet)
- SQL Server, PostgreSQL, or SQLite (SQLite is default)

## Getting Started

### 1. Install Dependencies

```bash
# Restore NuGet packages
dotnet restore

# Install ABP CLI (if not already installed)
dotnet tool install -g Volo.Abp.Cli

# Install client-side libraries
abp install-libs
```

### 2. Configure Database

The application uses SQLite by default. To use a different database, update the connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Data Source=HomeServicesApp.db"
  }
}
```

### 3. Generate Signing Certificate

For production environments, generate an OpenIddict certificate:

```bash
dotnet dev-certs https -v -ep openiddict.pfx -p 67e97d7e-be6e-42b5-bcb6-2d7fa2e621f8
```

### 4. Create the Database

Run the database migrator to create the initial database:

```bash
cd src/HomeServicesApp.DbMigrator
dotnet run
```

### 5. Run the Applications

Start the authentication server:
```bash
cd src/HomeServicesApp.AuthServer
dotnet run
```

In a new terminal, start the API host:
```bash
cd src/HomeServicesApp.HttpApi.Host
dotnet run
```

The API will be available at:
- **API Host**: `https://localhost:44375`
- **Auth Server**: `https://localhost:44322`
- **Swagger UI**: `https://localhost:44375/swagger`

## Configuration

### Application Settings

Key configuration files:
- `appsettings.json` - Base application settings
- `appsettings.Development.json` - Development environment settings
- `appsettings.secrets.json` - Sensitive configuration (not in source control)

### Key Configuration Areas

```json
{
  "ConnectionStrings": {
    "Default": "Data Source=HomeServicesApp.db"
  },
  "OpenIddict": {
    "Applications": {
      "HomeServicesApp_App": {
        "ClientId": "HomeServicesApp_App",
        "RootUrl": "http://localhost:3000"
      }
    }
  },
  "Settings": {
    "Abp.Mailing.Smtp.Host": "smtp.gmail.com",
    "Abp.Mailing.Smtp.Port": "587",
    "Abp.Mailing.Smtp.UserName": "your-email@gmail.com",
    "Abp.Mailing.Smtp.Password": "your-password"
  }
}
```

## API Documentation

### Authentication Endpoints
- `POST /connect/token` - Get access token
- `POST /api/account/register` - User registration
- `GET /api/account/profile` - Get user profile
- `PUT /api/account/profile` - Update user profile

### Core Service Endpoints
- `GET /api/app/service` - Service catalog management
- `GET /api/app/category` - Service categories
- `GET /api/app/order` - Order management
- `GET /api/app/provider` - Provider management
- `GET /api/app/review` - Review system
- `GET /api/app/payments` - Payment processing
- `GET /api/app/complaints` - Complaint management
- `GET /api/app/analytics` - Analytics and reporting
- `GET /api/app/dashboard` - Dashboard data
- `GET /api/app/notification` - Notification system
- `GET /api/app/monitoring` - System monitoring

## Development

### Building the Solution

```bash
# Build entire solution
dotnet build HomeServicesApp.sln

# Build specific project
dotnet build src/HomeServicesApp.HttpApi.Host
```

### Running Tests

```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test test/HomeServicesApp.Application.Tests

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Database Migrations

```bash
# Add new migration
cd src/HomeServicesApp.EntityFrameworkCore
dotnet ef migrations add YourMigrationName

# Update database
cd ../HomeServicesApp.DbMigrator
dotnet run

# Remove last migration
cd ../HomeServicesApp.EntityFrameworkCore
dotnet ef migrations remove
```

### Code Generation

```bash
# Generate CRUD pages for an entity
abp generate crud YourEntity -t mvc-module

# Generate proxy classes for HTTP APIs
abp generate-proxy -t csharp -u https://localhost:44375
```

## Deployment

### Production Configuration

1. **Update connection strings** for production database
2. **Set up HTTPS certificates** for secure communication
3. **Configure email settings** for notifications
4. **Set up external authentication** providers (Google, Facebook, etc.)

### Docker Deployment

```bash
# Build Docker image
docker build -t homeservicesapp-api .

# Run with Docker Compose
docker-compose up -d
```

### Cloud Deployment

The application can be deployed to:
- **Azure App Service**
- **AWS Elastic Beanstalk**
- **Google Cloud Run**
- **Kubernetes clusters**

Refer to the [ABP Framework Deployment documentation](https://abp.io/docs/latest/deployment) for detailed guidance.

## Monitoring and Logging

### Application Insights
Configure Application Insights for monitoring:

```json
{
  "ApplicationInsights": {
    "InstrumentationKey": "your-instrumentation-key"
  }
}
```

### Serilog Configuration
Logging is configured with Serilog for structured logging:

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

## Security

### Authentication
- JWT tokens with configurable expiration
- Refresh token support
- External OAuth providers (Google, Facebook)
- Two-factor authentication support

### Authorization
- Role-based access control
- Permission-based authorization
- Resource-based authorization
- API key authentication for external services

### Data Protection
- Automatic data encryption for sensitive fields
- GDPR compliance features
- Audit logging for all operations
- Rate limiting and throttling

## Performance

### Caching
- In-memory distributed caching for application data
- HTTP response caching
- Database query result caching

### Database Optimization
- Entity Framework query optimization
- Database indexing strategies
- Connection pooling
- Read/write database separation support

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check connection string in appsettings.json
   - Ensure database server is running
   - Verify database permissions

2. **Authentication issues**
   - Check OpenIddict configuration
   - Verify client credentials
   - Ensure HTTPS is properly configured

3. **Cache or locking issues**
   - Check that App_Data directory is writable
   - Verify file-based locking directory permissions
   - Clear cache files if needed

### Debugging

```bash
# Run with detailed logging
dotnet run --environment Development

# Enable Entity Framework logging
dotnet ef database update --verbose

# Check application health
curl https://localhost:44375/health
```

## Contributing

1. Follow ABP Framework conventions and best practices
2. Use the repository pattern for data access
3. Implement proper error handling and logging
4. Add unit tests for new features
5. Update API documentation for new endpoints
6. Follow C# coding standards and conventions

## Additional Resources

- [ABP Framework Documentation](https://abp.io/docs/latest)
- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [OpenIddict Documentation](https://documentation.openiddict.com/)
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)

## License

This project contains code from multiple sources. Please refer to the original repositories for licensing information.

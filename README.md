# Combined Home Services Backend

This repository contains the complete backend solution for the Home Services application, combining components from the original `handy-home-hatch` and `HomeServicesApp` repositories.

## Overview

This is a comprehensive .NET backend solution built on the ABP Framework that provides APIs for a home services platform. The system supports:

- **Customer Management** - User registration, profiles, and service bookings
- **Service Provider Management** - Provider registration, approval workflows, and service delivery
- **Order Management** - Service booking, scheduling, and order lifecycle management
- **Payment Processing** - Payment methods, transactions, and refund management
- **Analytics & Monitoring** - Dashboard analytics, system health monitoring, and performance metrics
- **Authentication & Authorization** - OAuth 2.0 with OpenIddict and role-based access control
- **Notifications** - Push notifications via Firebase Cloud Messaging

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

## API Documentation

The backend implements comprehensive REST APIs that correspond to the frontend expectations documented in `HOMESERVICE_API_INTEGRATION.md`. Key API endpoints include:

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/logout` - User logout

### Core Service Endpoints
- `GET /api/service` - Service catalog management
- `GET /api/category` - Service categories
- `GET /api/order` - Order management
- `GET /api/provider` - Provider management
- `GET /api/review` - Review system
- `GET /api/payments` - Payment processing
- `GET /api/complaints` - Complaint management
- `GET /api/analytics` - Analytics and reporting
- `GET /api/dashboard` - Dashboard data
- `GET /api/notification` - Notification system
- `GET /api/monitoring` - System monitoring

## Prerequisites

- [.NET 9.0+ SDK](https://dotnet.microsoft.com/download/dotnet)
- [Node v20.11+](https://nodejs.org/en) (for frontend integration)
- [Redis](https://redis.io/) (for caching and session management)

## Configuration

The solution includes multiple configuration files:

- `appsettings.json` - Base application settings
- `appsettings.Development.json` - Development environment settings
- `appsettings.secrets.json` - Sensitive configuration (not in source control)

Key configuration areas:
- **ConnectionStrings** - Database connection settings
- **OpenIddict** - Authentication server configuration
- **Redis** - Caching configuration
- **SMTP** - Email service settings
- **Twilio** - SMS service configuration
- **Firebase** - Push notification settings

## Getting Started

### 1. Generate Signing Certificate

For production environments, generate an OpenIddict certificate:

```bash
dotnet dev-certs https -v -ep openiddict.pfx -p 67e97d7e-be6e-42b5-bcb6-2d7fa2e621f8
```

### 2. Install Client-Side Libraries

```bash
abp install-libs
```

### 3. Create the Database

Run the database migrator to create the initial database:

```bash
cd src/HomeServicesApp.DbMigrator
dotnet run
```

### 4. Run the Applications

Start the authentication server:
```bash
cd src/HomeServicesApp.AuthServer
dotnet run
```

Start the API host:
```bash
cd src/HomeServicesApp.HttpApi.Host
dotnet run
```

## Solution Structure

```
combined-home-services-backend/
├── src/
│   ├── HomeServicesApp.Application/          # Business logic layer
│   ├── HomeServicesApp.Application.Contracts/ # Service contracts and DTOs
│   ├── HomeServicesApp.AuthServer/           # Authentication server
│   ├── HomeServicesApp.DbMigrator/           # Database migrations
│   ├── HomeServicesApp.Domain/               # Domain entities and business rules
│   ├── HomeServicesApp.Domain.Shared/        # Shared domain components
│   ├── HomeServicesApp.EntityFrameworkCore/  # Data access layer
│   ├── HomeServicesApp.HttpApi/              # Web API controllers
│   ├── HomeServicesApp.HttpApi.Client/       # HTTP client
│   └── HomeServicesApp.HttpApi.Host/         # API hosting application
├── test/
│   ├── HomeServicesApp.Application.Tests/
│   ├── HomeServicesApp.Domain.Tests/
│   ├── HomeServicesApp.EntityFrameworkCore.Tests/
│   ├── HomeServicesApp.HttpApi.Client.ConsoleTestApp/
│   └── HomeServicesApp.TestBase/
├── HomeServicesApp.sln                       # Solution file
├── common.props                              # Common MSBuild properties
├── NuGet.Config                              # NuGet package sources
└── HOMESERVICE_API_INTEGRATION.md           # API documentation reference
```

## Source Repositories

This combined backend was created from:

- **aramadan19912/HomeServicesApp** - Complete .NET backend solution with ABP Framework
- **aramadan19912/handy-home-hatch** - React frontend with API client code and documentation

The `HOMESERVICE_API_INTEGRATION.md` file provides valuable documentation on how the frontend expects to interact with these backend APIs.

## Development

### Building the Solution

```bash
dotnet build HomeServicesApp.sln
```

### Running Tests

```bash
dotnet test
```

### Database Migrations

To add a new migration:

```bash
cd src/HomeServicesApp.EntityFrameworkCore
dotnet ef migrations add YourMigrationName
```

## Deployment

For deployment guidance, refer to the [ABP Framework Deployment documentation](https://abp.io/docs/latest/deployment).

## Additional Resources

- [ABP Framework Documentation](https://abp.io/docs/latest)
- [Web Application Development Tutorial](https://abp.io/docs/latest/tutorials/book-store/part-01?UI=Blazor&DB=EF)
- [Application Startup Template Structure](https://abp.io/docs/latest/solution-templates/layered-web-application)

## License

This project contains code from multiple sources. Please refer to the original repositories for licensing information.

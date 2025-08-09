# Use the official .NET 9.0 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj", "src/HomeServicesApp.HttpApi.Host/"]
COPY ["src/HomeServicesApp.Application/HomeServicesApp.Application.csproj", "src/HomeServicesApp.Application/"]
COPY ["src/HomeServicesApp.Application.Contracts/HomeServicesApp.Application.Contracts.csproj", "src/HomeServicesApp.Application.Contracts/"]
COPY ["src/HomeServicesApp.Domain/HomeServicesApp.Domain.csproj", "src/HomeServicesApp.Domain/"]
COPY ["src/HomeServicesApp.Domain.Shared/HomeServicesApp.Domain.Shared.csproj", "src/HomeServicesApp.Domain.Shared/"]
COPY ["src/HomeServicesApp.EntityFrameworkCore/HomeServicesApp.EntityFrameworkCore.csproj", "src/HomeServicesApp.EntityFrameworkCore/"]
COPY ["src/HomeServicesApp.HttpApi/HomeServicesApp.HttpApi.csproj", "src/HomeServicesApp.HttpApi/"]
COPY ["src/HomeServicesApp.HttpApi.Client/HomeServicesApp.HttpApi.Client.csproj", "src/HomeServicesApp.HttpApi.Client/"]

# Copy common.props
COPY ["common.props", "."]

RUN dotnet restore "src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj"

# Copy the rest of the source code
COPY . .

# Build the application
WORKDIR "/src/src/HomeServicesApp.HttpApi.Host"
RUN dotnet build "HomeServicesApp.HttpApi.Host.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "HomeServicesApp.HttpApi.Host.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Install Entity Framework tools for migrations
RUN dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"

ENTRYPOINT ["dotnet", "HomeServicesApp.HttpApi.Host.dll"]
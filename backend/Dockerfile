# Stage 1: build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and config files
COPY HomeServicesApp.sln ./
COPY NuGet.Config ./
COPY common.props ./

# Copy all csproj files to restore dependencies (better layer caching)
COPY src/HomeServicesApp.Application/*.csproj ./src/HomeServicesApp.Application/
COPY src/HomeServicesApp.Application.Contracts/*.csproj ./src/HomeServicesApp.Application.Contracts/
COPY src/HomeServicesApp.AuthServer/*.csproj ./src/HomeServicesApp.AuthServer/
COPY src/HomeServicesApp.DbMigrator/*.csproj ./src/HomeServicesApp.DbMigrator/
COPY src/HomeServicesApp.Domain/*.csproj ./src/HomeServicesApp.Domain/
COPY src/HomeServicesApp.Domain.Shared/*.csproj ./src/HomeServicesApp.Domain.Shared/
COPY src/HomeServicesApp.EntityFrameworkCore/*.csproj ./src/HomeServicesApp.EntityFrameworkCore/
COPY src/HomeServicesApp.HttpApi/*.csproj ./src/HomeServicesApp.HttpApi/
COPY src/HomeServicesApp.HttpApi.Client/*.csproj ./src/HomeServicesApp.HttpApi.Client/
COPY src/HomeServicesApp.HttpApi.Host/*.csproj ./src/HomeServicesApp.HttpApi.Host/

# Copy test project files
COPY test/HomeServicesApp.Application.Tests/*.csproj ./test/HomeServicesApp.Application.Tests/
COPY test/HomeServicesApp.Domain.Tests/*.csproj ./test/HomeServicesApp.Domain.Tests/
COPY test/HomeServicesApp.EntityFrameworkCore.Tests/*.csproj ./test/HomeServicesApp.EntityFrameworkCore.Tests/
COPY test/HomeServicesApp.HttpApi.Client.ConsoleTestApp/*.csproj ./test/HomeServicesApp.HttpApi.Client.ConsoleTestApp/
COPY test/HomeServicesApp.TestBase/*.csproj ./test/HomeServicesApp.TestBase/

# Restore dependencies
RUN dotnet restore HomeServicesApp.sln

# Copy the rest of the source code
COPY src ./src
COPY test ./test

# publish the host
RUN dotnet publish src/HomeServicesApp.HttpApi.Host/HomeServicesApp.HttpApi.Host.csproj -c Release -o /app/publish /p:UseAppHost=false
# publish the migrator
RUN dotnet publish src/HomeServicesApp.DbMigrator/HomeServicesApp.DbMigrator.csproj -c Release -o /app/migrator /p:UseAppHost=false

# Stage 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# optional: set non-root user later if needed

# environment
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

# copy builds
COPY --from=build /app/publish ./host
COPY --from=build /app/migrator ./migrator

# add entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# create data dir for sqlite
RUN mkdir -p /data
VOLUME ["/data"]

ENTRYPOINT ["/entrypoint.sh"]
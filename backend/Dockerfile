# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY *.sln ./
COPY src/*/*.csproj ./
RUN for file in $(ls *.csproj); do mkdir -p src/${file%.*}/ && mv $file src/${file%.*}/; done

# Restore packages
RUN dotnet restore

# Copy source code
COPY . .

# Build the application
WORKDIR /src/src/HomeServicesApp.HttpApi.Host
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime stage  
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Install required packages for Railway deployment
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=build /app/publish .

# Expose port (Railway uses PORT environment variable)
EXPOSE $PORT

# Create startup script that uses Railway's PORT
RUN echo '#!/bin/bash\ndotnet HomeServicesApp.HttpApi.Host.dll --urls "http://0.0.0.0:$PORT"' > /app/start.sh \
    && chmod +x /app/start.sh

# Use the startup script
CMD ["/app/start.sh"]
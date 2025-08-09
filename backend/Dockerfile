# Stage 1: build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy sln and restore
COPY HomeServicesApp.sln ./
COPY NuGet.Config ./
COPY common.props ./
COPY src ./src
RUN dotnet restore HomeServicesApp.sln

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
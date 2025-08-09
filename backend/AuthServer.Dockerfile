# Stage 1: build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY HomeServicesApp.sln ./
COPY NuGet.Config ./
COPY common.props ./
COPY src ./src
RUN dotnet restore HomeServicesApp.sln
RUN dotnet publish src/HomeServicesApp.AuthServer/HomeServicesApp.AuthServer.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:8081
EXPOSE 8081
COPY --from=build /app/publish ./auth
ENTRYPOINT ["dotnet", "/app/auth/HomeServicesApp.AuthServer.dll"]
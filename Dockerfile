# Сборка и запуск ASP.NET Core 8 для Railway (или любого Docker-хостинга)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FilmsAPI.csproj", "./"]
RUN dotnet restore "FilmsAPI.csproj"
COPY . .
RUN dotnet publish "FilmsAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FilmsAPI.dll"]

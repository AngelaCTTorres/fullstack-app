# 🔧 Etapa de construcción
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

# Copiar archivo de proyecto y restaurar dependencias
COPY *.csproj ./
RUN dotnet restore

# Copiar el resto del código y compilar en modo Release
COPY . ./
RUN dotnet publish -c Release -o out

# 🚀 Etapa de producción
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# Copiar los archivos compilados desde la etapa de build
COPY --from=build /app/out .

EXPOSE 8080

# Iniciar la app
ENTRYPOINT ["dotnet", "backend.dll"]

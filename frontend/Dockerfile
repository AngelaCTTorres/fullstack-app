# Etapa de construcción
FROM node:18-alpine AS build

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación Remix
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Copiar dependencias para producción
COPY package*.json ./
RUN npm ci

# Copiar el build de Remix
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public


EXPOSE 3000

CMD ["npm", "start"]

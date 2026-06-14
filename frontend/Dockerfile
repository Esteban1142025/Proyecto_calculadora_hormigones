# Etapa 1: build
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: servidor estático con Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Configuración para que React Router funcione con rutas anidadas
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

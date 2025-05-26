# # Utiliser une image Node.js pour construire l'application
# FROM node:18 AS builder

# # Définir le répertoire de travail
# WORKDIR /app

# # Copier les fichiers nécessaires
# COPY package*.json ./
# COPY . .

# # Installer les dépendances et construire l'application
# RUN npm install && npm install --save-dev @types/node
# RUN npm run build

# # Utiliser une image Nginx pour servir l'application
# FROM nginx:alpine

# # Copier les fichiers construits dans le dossier Nginx
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Exposer le port utilisé par Nginx
# EXPOSE 80

# Étape de build avec Node.js
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install && npm install --save-dev @types/node
COPY . .
RUN npm run build

# Étape finale avec Deno
FROM denoland/deno:debian

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./
COPY --from=build /app/ssl ./ssl

EXPOSE 443

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "server.ts"]
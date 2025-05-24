# Utiliser une image Node.js pour construire l'application
FROM node:18 AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./
COPY . .

# Installer les dépendances et construire l'application
RUN npm install && npm install --save-dev @types/node
RUN npm run build

# Utiliser une image Nginx pour servir l'application
FROM nginx:alpine

# Copier les fichiers construits dans le dossier Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port utilisé par Nginx
EXPOSE 80
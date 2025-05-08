# Utilisez une image de base Node.js pour construire l'application Vue.js
FROM node:16 as build-stage

# Définissez le répertoire de travail
WORKDIR /app

# Copiez les fichiers package.json et package-lock.json
COPY package*.json ./

# Installez les dépendances
RUN npm install

# Copiez le reste des fichiers de l'application
COPY . .

# Construisez l'application Vue.js
RUN npm run build

# Utilisez une image de base Deno pour servir l'application
FROM denoland/deno:latest

# Définissez le répertoire de travail
WORKDIR /app

# Copiez les fichiers construits depuis l'étape de construction
COPY --from=build-stage /app/dist ./dist

# Copiez le fichier server.ts
COPY server.ts .

# Exposez le port sur lequel le serveur Deno écoutera
EXPOSE 80

# Commande pour démarrer le serveur Deno
CMD ["deno", "run", "--allow-net", "--allow-read", "server.ts"]

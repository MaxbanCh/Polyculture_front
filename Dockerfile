# Étape de build avec Node.js
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install && npm install --save-dev @types/node
COPY . .
RUN npm run build

# Étape finale avec Deno
FROM denoland/deno:alpine

WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/server.ts ./
# COPY --from=build /app/ssl ./ssl

EXPOSE 80
CMD ["cat", "dist/index.html"]
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "server.ts"]
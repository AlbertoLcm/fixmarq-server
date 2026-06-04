FROM node:22.12-slim AS builder

# Instalamos dependencias para Prisma y compilación
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Instalamos TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm install

COPY . .

# Generamos Prisma y construimos el proyecto
RUN npx prisma generate
RUN npm run build

# --- Etapa de Producción ---
FROM node:22.12-slim AS runner

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copiamos node_modules y el build de la etapa anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 3000

# Usamos la ruta absoluta al archivo .js
CMD ["node", "dist/main.js"]
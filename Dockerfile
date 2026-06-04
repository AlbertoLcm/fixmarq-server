# ETAPA 1: Construcción (Build)
FROM node:22.13-slim AS builder

# Instalar dependencias de compilación para Prisma y bcrypt/otros
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar solo lo necesario para instalar dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalación limpia
RUN npm install

# Copiar el código fuente y construir
COPY . .
RUN npx prisma generate
RUN npm run build

# ETAPA 2: Ejecución (Runtime)
FROM node:22.13-slim

WORKDIR /app

# Instalamos openssl en la imagen final porque Prisma lo necesita
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiamos solo los archivos necesarios de la etapa anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Exponer puerto
EXPOSE 3000

# Comando optimizado
CMD ["node", "dist/main"]
# Usa la versión exacta que requiere Prisma
FROM node:22.12-slim

# Instalar dependencias necesarias para Prisma y NestJS
RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Generar el cliente de Prisma y construir el proyecto
RUN npx prisma generate
RUN npm run build

# Exponer el puerto de NestJS (ajustar si usas otro)
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start:prod"]
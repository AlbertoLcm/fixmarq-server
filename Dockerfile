FROM node:22.12-slim

RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generamos prisma antes del build
RUN npx prisma generate
RUN npm run build

# Verificación de salida (esto aparecerá en los logs de Coolify al construir)
RUN ls -la /app/dist

EXPOSE 3000

# Ejecución directa
CMD ["node", "dist/main.js"]
FROM node:18-alpine
WORKDIR /app

# COPIAR AMBOS ARCHIVOS
COPY package.json package-lock.json ./

# USAR npm ci AHORA QUE YA EXISTE EL LOCK FILE
RUN npm ci --only=production

COPY src src

ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/server.js"]

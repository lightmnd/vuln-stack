# Fase 1: Installazione
FROM node:20 AS builder
WORKDIR /app

# Copio solo package.json per caching
COPY package*.json ./
RUN npm install

# Ora copio tutto il codice
COPY . .

# Fase 2: Immagine finale più pulita
FROM node:20
WORKDIR /app

# Solo i file necessari
COPY --from=builder /app .

# Espongo la porta usata dal server (se serve)
EXPOSE 4000

CMD ["node", "index.js"]

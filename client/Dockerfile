# Etichettato come "datato" apposta per DAST/SAST
FROM node:14

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

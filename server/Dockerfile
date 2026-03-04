FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

# Хранилище БД на persistent volume
ENV DATABASE_PATH=/data/pushups.db
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]

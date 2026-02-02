FROM node:18-alpine AS base
WORKDIR /app

# Install deps (use root package.json which contains backend deps)
COPY package*.json ./
RUN npm ci --only=production

# Copy source and expose port
COPY . .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "backend/src/index.js"]

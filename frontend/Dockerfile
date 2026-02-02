# Build stage
FROM node:18-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production stage (nginx)
FROM nginx:stable-alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
# Optional: add custom nginx conf if needed
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

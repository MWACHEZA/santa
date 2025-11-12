# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Backend build stage
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/

# Copy frontend build
COPY --from=frontend-build /app/build ./frontend/build

# Install serve to serve frontend
RUN npm install -g serve

EXPOSE 3000 3001

# Start both frontend and backend
CMD ["sh", "-c", "cd backend && npm start & serve -s frontend/build -l 3000"]

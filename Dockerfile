# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy all frontend source files
COPY frontend/ ./

# Build the frontend for production
RUN npm run build

# Stage 2: Build the Backend and Serve
FROM node:20-alpine

WORKDIR /app

# Copy backend package files and prisma directory
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install backend dependencies
RUN npm install

# Copy backend source files
COPY backend/ ./

# Copy the built frontend static files from Stage 1 into the backend's 'public' folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

# Start the server (which runs migrations, seeding, and the Express app)
CMD ["npm", "start"]

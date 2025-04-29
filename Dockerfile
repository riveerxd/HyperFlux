# Base image
FROM node:20-alpine

# Install OpenSSL dependencies
RUN apk add --no-cache openssl openssl-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client with the correct binary target for Alpine Linux
RUN npx prisma generate

# Copy rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]

# Use official Node.js active LTS image
FROM node:18-alpine

# Install build dependencies for sqlite3 compilation if needed
RUN apk add --no-cache python3 make g++

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package descriptors first to maximize layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy remaining source code
COPY . .

# Expose production port
EXPOSE 5000

# Set environment production flag
ENV NODE_ENV=production

# Start application server
CMD [ "node", "server.js" ]

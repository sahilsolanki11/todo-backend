# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json first and install dependencies
COPY package*.json ./
RUN npm install

# Copy all backend source code
COPY . .

# Copy environment file from Jenkins workspace
COPY .env .env

# Expose backend port
EXPOSE 5000

# Start the backend
CMD ["node", "server.js"]

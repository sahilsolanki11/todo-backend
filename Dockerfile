# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all backend code
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the backend
CMD ["node", "server.js"]

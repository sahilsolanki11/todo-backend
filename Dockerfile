# Use official Node.js LTS image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose the backend default port
EXPOSE 5000

# Start the backend application
CMD ["npm", "start"]

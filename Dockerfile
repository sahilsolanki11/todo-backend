FROM node:20
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the app code
COPY . .

# Do NOT copy .env file
# COPY .env ./

EXPOSE 5000
CMD ["npm", "start"]

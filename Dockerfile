FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# copy local .env into image so the container has MONGO_URI
COPY .env ./

EXPOSE 5000
CMD ["npm", "start"]

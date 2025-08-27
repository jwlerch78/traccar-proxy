# Use official Node 18 image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the port Render will assign
ENV PORT=10000
EXPOSE $PORT

# Start the Node server
CMD ["node", "server.js"]

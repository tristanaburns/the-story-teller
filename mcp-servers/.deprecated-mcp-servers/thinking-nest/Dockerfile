FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from the build stage
COPY --from=build /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3003

# Command to run the application
CMD ["node", "dist/main"]

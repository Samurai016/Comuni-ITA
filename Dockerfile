# Use a lightweight Node.js image as the base
FROM node:lts-alpine as base

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code and data
COPY src ./src
COPY data ./data
COPY tsconfig.json ./

# Build TypeScript code
RUN npm install typescript
RUN npx tsc

# --- Production Stage ---
FROM node:lts-alpine as production

# Set environment to production
ENV NODE_ENV production

# Create app directory
WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/data ./data

# Expose the port the app runs on
EXPOSE 8080

# Run the application
CMD [ "node", "dist/http/server.js" ]

# Use official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN yarn build

# Create a directory for the SQLite database
RUN mkdir -p /app/data

# Expose port (adjust if your app uses a different port)
EXPOSE 3001

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"] 
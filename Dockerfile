# Use an official Node.js image
FROM node:18-bullseye-slim AS builder

# Create app directory
WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Generate Prisma client and apply migrations
RUN npx prisma generate
RUN npx prisma migrate deploy

# Seed the database
RUN npm run seed

# Build the Next.js app
RUN npm run build


# Production image
FROM node:18-bullseye-slim AS runner
WORKDIR /app

# Set the DATABASE_URL environment variable
# Adjust the path according to your prisma schema; for SQLite, it might be something like:
ENV DATABASE_URL="file:./prisma/dev.db"

# Copy files from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# IMPORTANT: Copy the prisma folder to include the SQLite database file (if using SQLite)
COPY --from=builder /app/prisma ./prisma

# Set the Next.js port
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]

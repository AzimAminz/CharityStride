FROM node:20-alpine

WORKDIR /app

# Install dependencies needed for native modules if any
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Environment variables for container runtime
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]

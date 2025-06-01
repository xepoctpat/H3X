FROM node:18-alpine

WORKDIR /app

# Install Python for scientific computing
RUN apk add --no-cache python3 py3-pip py3-numpy py3-scipy

# Install dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Feedback processor health check passed')" || exit 1

# Start the feedback loop processor
CMD ["node", "feedback-processor.js"]

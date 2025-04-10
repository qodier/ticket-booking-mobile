# Use multi-stage build for better efficiency on ARM devices
FROM node:20-alpine AS builder

# Build arguments
ARG TARGETPLATFORM
ARG BUILDPLATFORM

# Print build info
RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM"

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build the web app
RUN npm run web -- --non-interactive --no-dev --minify

# Create a smaller final image
FROM node:20-alpine


# Expose the port Expo web uses
EXPOSE 19006

# Copy from builder stage
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/context ./context
COPY --from=builder /app/services ./services
COPY --from=builder /app/styles ./styles
COPY --from=builder /app/types ./types
COPY --from=builder /app/web-build ./web-build

# Start the Expo web server
CMD ["npm", "run", "web", "--", "--non-interactive", "--port", "19006", "--host", "0.0.0.0"]
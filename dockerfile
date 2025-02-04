# Build stage
FROM golang:1.23.5 AS builder

WORKDIR /app

# Copy go.mod and go.sum first for layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage
FROM alpine:latest

WORKDIR /app

# Install CA certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy the binary from builder
COPY --from=builder /app/main .

# Copy static files and templates
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/*.html .
COPY --from=builder /app/credentials.json .

# Expose the port
EXPOSE 6776

# Run the application
CMD ["./main"]
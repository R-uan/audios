# Container Image
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the current directory to the container
COPY . .

RUN bun install

# Build application
RUN bun run build

# Expose the port on which teh API will listen
EXPOSE 3099

# run application
CMD bun run start -- -p 3099

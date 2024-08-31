# Use the official Ubuntu 20.04 image
FROM ubuntu:20.04

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Set a working directory in the container
WORKDIR /app

# Install Node.js, PostgreSQL, and other dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    build-essential \
    postgresql \
    postgresql-contrib && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy PostgreSQL configuration files
COPY Docker/pg_hba.conf /etc/postgresql/12/main/pg_hba.conf

# Install Knex CLI globally
RUN npm install -g knex

# Copy package.json and package-lock.json (if exists) to the working directory
COPY ./package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of your application code to the working directory
COPY . /app

# Copy the PostgreSQL setup script
COPY Docker/setup-postgres.sh /docker-entrypoint-initdb.d/

# Copy the entrypoint script
COPY Docker/entrypoint.sh /entrypoint.sh

# Make the scripts executable
RUN chmod +x /docker-entrypoint-initdb.d/setup-postgres.sh /entrypoint.sh

# Expose ports for PostgreSQL and the application
EXPOSE 80

# Set the entrypoint to start PostgreSQL and Node.js
ENTRYPOINT ["/entrypoint.sh"]

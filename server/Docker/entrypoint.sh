#!/bin/bash

# Start PostgreSQL service
service postgresql start

# Execute the PostgreSQL setup script
/docker-entrypoint-initdb.d/setup-postgres.sh

# Start your Node.js application
exec node server.js

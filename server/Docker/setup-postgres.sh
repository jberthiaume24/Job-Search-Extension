#!/bin/bash

# Check if PostgreSQL is ready
if pg_isready -q; then
    echo "PostgreSQL is up and running."
else
    echo "PostgreSQL is not available."
    exit 1
fi

# Set the password for the postgres user (run as root directly)
echo "Setting PostgreSQL user password..."
psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres';"

# Create the database
echo "Creating database job_search_db..."
psql -U postgres -c "CREATE DATABASE job_search_db;"

# Run Knex migrations and seeds
echo "Running Knex migrations..."
npx knex migrate:latest --knexfile knexfile.js
echo "Running Knex seeds..."
npx knex seed:run --knexfile knexfile.js

# List databases
psql -U postgres -c "\l"

# Query and display the Users table
echo "Users table"
psql -U postgres -d job_search_db -c "SELECT * FROM users;"

# Query and display the Applications table
echo "Applications table"
psql -U postgres -d job_search_db -c "SELECT * FROM applications;"

# Query and display the Statistics table
echo "Statistics table"
psql -U postgres -d job_search_db -c "SELECT * FROM statistics;"

# Query and display the Apps By Result table
echo "Apps By Result table"
psql -U postgres -d job_search_db -c "SELECT * FROM apps_by_result;"

# End script
echo "PostgreSQL setup completed."

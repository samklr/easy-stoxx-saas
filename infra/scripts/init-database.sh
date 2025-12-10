#!/bin/bash

# Script to initialize the database schema in Cloud SQL
# This script connects to Cloud SQL via Cloud SQL Proxy and runs the schema.sql file

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_info "Checking prerequisites..."

    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed"
        exit 1
    fi

    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) is not installed"
        exit 1
    fi

    if ! command -v cloud-sql-proxy &> /dev/null; then
        print_warn "cloud-sql-proxy is not installed. Install it with:"
        echo "  curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64"
        echo "  chmod +x cloud-sql-proxy"
        exit 1
    fi

    print_info "All prerequisites satisfied"
}

# Get database connection details
get_connection_details() {
    print_info "Retrieving database connection details..."

    # Get from Terraform outputs
    cd "$(dirname "$0")/.."

    CLOUD_SQL_INSTANCE=$(terraform output -raw database_connection_name 2>/dev/null)
    DB_NAME=$(terraform output -raw database_name 2>/dev/null)

    if [ -z "$CLOUD_SQL_INSTANCE" ]; then
        print_error "Could not retrieve database connection name from Terraform outputs"
        print_error "Make sure you have run 'terraform apply' first"
        exit 1
    fi

    print_info "Cloud SQL Instance: $CLOUD_SQL_INSTANCE"
    print_info "Database Name: $DB_NAME"
}

# Get database password from Secret Manager
get_db_password() {
    print_info "Retrieving database password from Secret Manager..."

    DB_PASSWORD=$(gcloud secrets versions access latest --secret=db-password 2>/dev/null)

    if [ -z "$DB_PASSWORD" ]; then
        print_error "Could not retrieve database password from Secret Manager"
        exit 1
    fi

    print_info "Database password retrieved"
}

# Start Cloud SQL Proxy
start_proxy() {
    print_info "Starting Cloud SQL Proxy..."

    # Kill any existing proxy
    pkill -f cloud-sql-proxy || true

    # Start proxy in background
    cloud-sql-proxy "$CLOUD_SQL_INSTANCE" &
    PROXY_PID=$!

    print_info "Cloud SQL Proxy started (PID: $PROXY_PID)"
    print_info "Waiting for proxy to be ready..."
    sleep 5
}

# Stop Cloud SQL Proxy
stop_proxy() {
    if [ -n "$PROXY_PID" ]; then
        print_info "Stopping Cloud SQL Proxy (PID: $PROXY_PID)..."
        kill $PROXY_PID || true
    fi
}

# Trap to ensure proxy is stopped on exit
trap stop_proxy EXIT

# Initialize database schema
init_schema() {
    print_info "Initializing database schema..."

    SCHEMA_FILE="$(dirname "$0")/../modules/database/schema.sql"

    if [ ! -f "$SCHEMA_FILE" ]; then
        print_error "Schema file not found: $SCHEMA_FILE"
        exit 1
    fi

    # Connect to database and run schema
    PGPASSWORD="$DB_PASSWORD" psql \
        -h 127.0.0.1 \
        -U postgres \
        -d "$DB_NAME" \
        -f "$SCHEMA_FILE" \
        -v ON_ERROR_STOP=1

    if [ $? -eq 0 ]; then
        print_info "Database schema initialized successfully!"
    else
        print_error "Failed to initialize database schema"
        exit 1
    fi
}

# Verify schema
verify_schema() {
    print_info "Verifying database schema..."

    # List tables
    TABLES=$(PGPASSWORD="$DB_PASSWORD" psql \
        -h 127.0.0.1 \
        -U postgres \
        -d "$DB_NAME" \
        -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';")

    print_info "Tables created:"
    echo "$TABLES" | while read -r table; do
        if [ -n "$table" ]; then
            echo "  - $table"
        fi
    done
}

# Main execution
main() {
    print_info "=== Database Schema Initialization ==="
    echo ""

    check_prerequisites
    get_connection_details
    get_db_password
    start_proxy
    init_schema
    verify_schema

    echo ""
    print_info "=== Initialization Complete ==="
}

# Run main function
main

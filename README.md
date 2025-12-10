# Hotel & Restaurant Stock Management SaaS (MVP)

A comprehensive SaaS for managing inventory in hospitality businesses.

## Tech Stack
-   **Backend**: Java 21 (Spring Boot 3)
-   **Frontend**: Next.js 14 (TypeScript, Tailwind, Shadcn)
-   **Database**: PostgreSQL
-   **Infrastructure**: Docker, Google Cloud Run

## Prerequisites
-   Docker & Docker Compose

## Quick Start (Local Development)

We use Docker Compose to run the entire stack (Database, Backend, and Frontend) to ensure environment consistency.

1.  **Run the start script:**
    ```bash
    ./start-dev.sh
    ```
    *This will build the images and start the services.*

2.  **Access the application:**
    -   **Frontend**: http://localhost:3000
    -   **Backend API**: http://localhost:8080/api

## Project Structure
-   `/backend`: Spring Boot application.
-   `/frontend`: Next.js application.
-   `docker-compose.yml`: Local orchestration configuration.

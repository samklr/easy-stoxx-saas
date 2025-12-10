# Master Prompt: Hospitality Stock Management SaaS (MVP)

> **Role**: Act as a Senior Full-Stack Architect and Developer.
> **Objective**: Build a production-ready, secure, and scalable **Inventory Management SaaS** specifically designed for Hotels and Restaurants.
> **Deployment Target**: Google Cloud Platform (Cloud Run + Cloud SQL).

---

## 1. Product Overview
**Problem**: Hotel and restaurant owners lose money due to unmanaged stock, lack of visibility into food costs, and theft/waste.
**Solution**: A modern, mobile-friendly web application that allows teams to track inventory in real-time.
**Users**:
1.  **Platform Admin (Super User)**: God-mode access. Can manage Tenants, billing, and system-wide settings.
2.  **Owner (Tenant Admin)**: Full access to their specific Organization.
3.  **Employee (Staff)**: Limited access within their Organization. Can "Check In/Out" stock.

## 2. Technical Stack & Architecture
**Architecture**: Decoupled (Frontend + Backend API).

**Frontend (Client)**:
-   **Framework**: [Next.js 14+](https://nextjs.org/) (App Router). Used strictly as a Frontend consuming the Backend API.
-   **Language**: TypeScript.
-   **Styling**: Tailwind CSS + Shadcn/UI.
-   **State**: React Query (TanStack Query) for API state management.

**Backend (Server)**:
-   **Framework**: **Java Spring Boot 3.x** (Java 21 LTS).
-   **Build Tool**: Maven.
-   **API Style**: RESTful JSON.
-   **Security**: Spring Security 6+ (Oauth2 Resource Server / JWT).
-   **Database**: PostgreSQL (Cloud SQL).
-   **ORM**: Spring Data JPA / Hibernate.

**Auth**:
-   **Owner Registration**: Must support **OAuth2 Login** (Google, Facebook).
-   **Staff Login**: Email/Password (managed by Owner).
-   **Implementation**: Use Spring Security OAuth2 Client for the login flow or integrate with a provider context.

**Infrastructure**:
-   **Containerization**: Separate `Dockerfile` for Backend and Frontend.
-   **Deployment**: Google Cloud Run (2 Services: `api` and `web`).

## 3. Core Data Model (JPA Entities)
Design a relational schema using JPA Entities (`@Entity`). Use UUIDs (`@GeneratedValue(strategy = GenerationType.UUID)`).

1.  **Tenants**: `id`, `name`, `status` (ACTIVE, SUSPENDED), `created_at`, `plan_type`.
2.  **Users**: `id`, `name`, `email`, `role` (PLATFORM_ADMIN, ORG_OWNER, ORG_EMPLOYEE), `tenant_id` (nullable for super admins).
3.  **Categories**: `id`, `name` (e.g., "Dairy", "Alcohol", "Housekeeping").
4.  **Suppliers**: `id`, `name`, `contact_info`.
5.  **InventoryItems**:
    -   `id`, `name`, `sku`, `category_id`, `supplier_id`
    -   `unit` (e.g., kg, liter, bottle)
    -   `current_quantity` (BigDecimal).
    -   `unit_cost` (BigDecimal).
6.  **StockTransactions**:
    -   `id`, `item_id`, `user_id`, `type` (IN, OUT_USE, OUT_WASTE, AUDIT).
    -   `quantity_change` (Positive or negative).
    -   `cost_at_transaction` (Snapshot of value).
    -   `timestamp`.

## 4. Key Features to Implement
### Phase 1: Foundation (Backend)
-   [ ] **Spring Boot Structure**: Setup Controller/Service/Repository layers.
-   [ ] **Security Config**: JWT Filter chain, CORS config (allow Frontend), OAuth2 dependencies.
-   [ ] **User/Tenant API**: Endpoints for registration and onboarding.

### Phase 2: Foundation (Frontend)
-   [ ] **Next.js Setup**: Shadcn installation.
-   [ ] **Auth Integration**: Login page with "Sign in with Google/Facebook". Handling JWT storage (secure cookie or httpOnly).

### Phase 3: Inventory Features
-   [ ] **CRUD APIs**: Items, Categories, Suppliers.
-   [ ] **Transaction Logic**: Atomic updates to inventory levels.
-   [ ] **UI Implementation**: Forms and Tables connected to APIs via React Query.

### Phase 3: Reporting
-   [ ] **Activity Log**: Immutable table of all stock movements. Who moved what and when.
-   [ ] **Stock Report**: current levels vs par levels. Filter by Category.
-   [ ] **Value Report**: Total value of inventory on hand.

### Phase 4: Platform Administration (Super Admin)
-   [ ] **Tenant Management**: List all hotels/restaurants. Ability to "Suspend" or "Activate" access.
-   [ ] **Onboarding Flow**: Public registration page for new Owners to create a Tenant + User account.
-   [ ] **Global Search**: Admin-only ability to lookup any user or tenant by email/name.

## 5. Security & Best Practices
-   **Security**: Implement `@PreAuthorize` for role checks (e.g. `hasRole('ADMIN')`).
-   **Validation**: Use `jakarta.validation.constraints` (@NotNull, @Size) in DTOs.
-   **Exception Handling**: Global `@ControllerAdvice` to return clean JSON errors.
-   **CORS**: Allow strictly the frontend origin.

## 6. Implementation Instructions for the Agent
1.  **Backend Setup**: Initialize Spring Boot, setup Postgres connection, Create Entities.
2.  **Auth Implementation**: Configure SecurityFilterChain, create /auth/login and /auth/signup (handling OAuth tokens).
3.  **Frontend Init**: Setup Next.js, create an API Client helper (Axios/Fetch with interceptors).
4.  **Core Features**: Implement Organization/User management, then Inventory.
5.  **Deployment**: Create `Dockerfile.backend` and `Dockerfile.frontend`.

> **Constraint**: Do not use "Placeholders". If a feature is implemented, it must work. If it's intricate, implement the core logic simply but robustly.

---

**Output format required**:
Please ignore conversational filler. Start by setting up the project structure and identifying the first comprehensive step (e.g., "Step 1: Project Initialization & Database Schema").

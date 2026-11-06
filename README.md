# Ticket Management System (TMS)

A full-stack Ticket Management System built with **FastAPI**, **PostgreSQL**, and **Next.js**.

---

## Architecture Overview

- **Backend**: FastAPI with SQLAlchemy Core (functional CRUD approach), Pydantic v2 schemas.
- **Database**: PostgreSQL 16 with custom initialization scripts and timezone support (`Asia/Kolkata`).
- **Authentication & RBAC**: JWT Bearer tokens with bcrypt password hashing and Role-Based Access Control (`staff` vs. `customer`).
- **Containerization**: Docker Compose orchestrating database, backend, and frontend.

---

## Getting Started

### 1. Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- Node.js (for local frontend dev, optional)
- Python 3.12 (for local backend dev, optional)

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
JWT_SECRET=your-secure-random-secret-key
```

### 3. Build & Run with Docker Compose
```powershell
# Build and start all services in the background
docker compose up -d --build
```

The services will be available at:
- **Backend API**: http://localhost:8000
- **Interactive API Docs (Swagger UI)**: http://localhost:8000/docs
- **Frontend App**: http://localhost:3000

---

## Authentication & Role-Based Access Control (RBAC)

The API enforces role-based permissions using signed JSON Web Tokens (JWT).

### Seeded Users
| Username | Password | Role | Permissions |
|---|---|---|---|
| `admin` | `adminpass` | `staff` | Full CRUD on tickets, ticket types, and search |
| `customer1` | `customerpass` | `customer` | Can create tickets (`POST /tickets`), cannot view/modify others |

### Role Permissions Matrix
| Endpoint | Method | Role Allowed | Description |
|---|---|---|---|
| `/auth/login` | POST | Public | Authenticate and obtain JWT access token |
| `/tickets/` | POST | `customer`, `staff` | Book/create a new ticket |
| `/tickets/` | GET | `staff` only | List tickets (with pagination) |
| `/tickets/{id}` | GET | `staff` only | Retrieve a specific ticket |
| `/tickets/search` | GET | `staff` only | Search tickets by ID, name, contact |
| `/tickets/{id}` | PUT | `staff` only | Update ticket details |
| `/tickets/{id}` | DELETE | `staff` only | Delete a ticket |
| `/ticket-types/` | GET | `staff` only | List ticket types and prices |

---

## API Usage Examples

### 1. Log In (Obtain JWT Token)
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"adminpass"}'
```
**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 2. Access Protected Endpoints with Bearer Token
Include the token in the `Authorization` header:
```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"
$headers = @{ Authorization = "Bearer $token" }

# Search tickets (Staff only)
Invoke-RestMethod -Uri "http://localhost:8000/tickets/search?name=test" `
  -Method Get `
  -Headers $headers
```

---

## Running Automated Tests

Tests run directly inside the Docker container to ensure complete environment parity:

```powershell
docker compose exec backend pytest
```

Output includes 7 passing integration tests covering:
- Login success & invalid password rejection
- 401 Unauthorized on unauthenticated requests
- Customer ticket creation
- Customer 403 Forbidden enforcement on staff endpoints
- Staff ticket search and ticket types listing


---

## Frontend Application

The Next.js frontend is built with a dark‑blue / light‑blue glass‑morphism theme and complete role-based access control.

### Pages & Features
- **Dashboard (`/`)**: Displays the authenticated user's profile and role. Offers quick action cards tailored to their role (`staff` vs. `customer`).
- **Login (`/login`)**: Centered glass-card login page with error feedback and token persistence.
- **Manage Tickets (`/tickets`)** *(Staff only)*:
  - Lists all tickets with ticket type badges (Regular, Premium, VIP, VVIP) and formatted prices.
  - Multi-parameter search filter (by Ticket ID, Customer Name, and Contact Number).
  - Modal-based ticket editing (update customer name, contact number, or tier with live recalculated LKR price).
  - Single-click ticket deletion with confirmation prompt.
  - Role-protected via `<ProtectedRoute requiredRole="staff">`.
- **Book Ticket (`/book`)** *(Staff & Customer)*:
  - Form to book a ticket by specifying Customer Name, Contact Number, and Ticket Type.
  - Real-time base price preview according to selected pass tier.
  - Role-protected via `<ProtectedRoute>`.
- **Route Guard (`ProtectedRoute.tsx`)**: Reusable wrapper that verifies authentication and required roles, redirecting unauthenticated users to `/login` or displaying an *Access Denied* screen if unauthorized.

> **How to test**
> 1. Run the stack (`docker compose up -d` then `cd frontend && npm run dev`).
> 2. Open `http://localhost:3000/login` and sign in:
>    - Sign in as `admin` (`adminpass`) &rarr; Navigate to `/tickets` to view, search, and delete tickets.
>    - Sign in as `customer1` (`customerpass`) &rarr; Access `/book` to reserve tickets; visiting `/tickets` displays *Access Denied*.


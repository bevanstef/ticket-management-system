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


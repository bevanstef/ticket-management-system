-- Set database and role timezone to local timezone (Asia/Kolkata, UTC+5:30)
ALTER DATABASE ticket_management SET timezone TO 'Asia/Kolkata';
ALTER ROLE tms_user SET timezone TO 'Asia/Kolkata';

-- Ticket types lookup table seed
CREATE TABLE IF NOT EXISTS ticket_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL
);

INSERT INTO ticket_types (name, price) VALUES
('Regular', 1500.00),
('Premium', 2000.00),
('VIP', 3500.00),
('VVIP', 6000.00)
ON CONFLICT (name) DO NOTHING;

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    type_id INTEGER NOT NULL REFERENCES ticket_types(id),
    ticket_price INTEGER NOT NULL,
    booked_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_tickets_id ON tickets (id);

-- Users table (authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_users_id ON users (id);

-- Seed users:
-- admin / adminpass (staff)
-- customer1 / customerpass (customer)
INSERT INTO users (username, hashed_password, role) VALUES
('admin', '$2b$12$4GyQib/ExrSIZnb9Ptwt7.npwQUzbp4n1E0URuCUKm1NeT4bCDu2K', 'staff')
ON CONFLICT (username) DO NOTHING;




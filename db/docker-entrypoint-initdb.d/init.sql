-- Ticket types lookup table seed
CREATE TABLE IF NOT EXISTS ticket_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL
);

INSERT INTO ticket_types (name, price) VALUES
('Regular', 20.00),
('Premium', 50.00),
('VIP', 100.00),
('VVIP', 200.00)
ON CONFLICT (name) DO NOTHING;


-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Aircraft Table
CREATE TABLE IF NOT EXISTS Aircraft (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    total_seats INTEGER NOT NULL,
    seat_layout VARCHAR(255) NOT NULL, -- e.g., '3-3' or '2-4-2'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flights Table
CREATE TABLE IF NOT EXISTS Flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_number VARCHAR(100) UNIQUE NOT NULL,
    aircraft_id UUID REFERENCES Aircraft(id) ON DELETE RESTRICT,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seats Table
CREATE TABLE IF NOT EXISTS Seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID REFERENCES Flights(id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL, -- e.g., '1A', '12F'
    seat_type VARCHAR(20) NOT NULL CHECK (seat_type IN ('Window', 'Middle', 'Aisle')),
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Booked', 'Selected')),
    UNIQUE(flight_id, seat_number)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS Bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES Users(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES Flights(id) ON DELETE CASCADE,
    seat_id UUID REFERENCES Seats(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled')),
    payment_status VARCHAR(50) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    booking_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flights_search ON Flights(source, destination, departure_time);
CREATE INDEX IF NOT EXISTS idx_seats_flight ON Seats(flight_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON Bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight ON Bookings(flight_id);

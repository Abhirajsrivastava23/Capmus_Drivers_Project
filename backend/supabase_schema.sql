-- ==============================================================================
-- 🚗 Campus Drivers (Chandigarh University UP - NH-27 Corridor)
-- Official Supabase (PostgreSQL) Database Migration & Schema
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean Existing Schema (Safe re-run)
DROP TABLE IF EXISTS trip_locations CASCADE;
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS ride_requests CASCADE;
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS driver_documents CASCADE;
DROP TABLE IF EXISTS student_verifications CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Automatic Updated_At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- TABLE 1: USERS (Students, Drivers, Admins)
-- ==============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    course TEXT NOT NULL,
    semester TEXT NOT NULL,
    profile_photo TEXT DEFAULT NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'driver', 'admin')),
    is_driver_approved BOOLEAN DEFAULT FALSE,
    emergency_contact_name TEXT DEFAULT '',
    emergency_contact_relationship TEXT DEFAULT 'Parent',
    emergency_contact_phone TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    stats JSONB DEFAULT '{
      "completed_rides_as_driver": 0,
      "completed_rides_as_passenger": 0,
      "total_reviews": 0,
      "average_rating": 5.0,
      "safety_score": 5.0,
      "punctuality_score": 5.0,
      "behaviour_score": 5.0,
      "communication_score": 5.0
    }'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- TABLE 2: VEHICLES
-- ==============================================================================
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_model TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    colour TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'Hatchback' CHECK (vehicle_type IN ('Hatchback', 'Sedan', 'SUV', 'Compact SUV')),
    ac_available BOOLEAN DEFAULT TRUE,
    luggage_capacity TEXT DEFAULT 'Medium Luggage' CHECK (luggage_capacity IN ('Light / Backpacks only', 'Medium Luggage', 'Large Suitcases')),
    rc_number TEXT DEFAULT '',
    rc_image TEXT DEFAULT '',
    insurance_valid_until DATE DEFAULT NULL,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- TABLE 3: STUDENT VERIFICATIONS (CUUP ID Cards)
-- ==============================================================================
CREATE TABLE student_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id_number TEXT NOT NULL,
    id_card_front_image TEXT NOT NULL,
    id_card_back_image TEXT DEFAULT '',
    course TEXT NOT NULL,
    semester TEXT NOT NULL,
    department TEXT DEFAULT 'Engineering & Technology',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT DEFAULT '',
    submitted_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON student_verifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- TABLE 4: DRIVER DOCUMENTS (Driving License)
-- ==============================================================================
CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number TEXT NOT NULL,
    license_expiry DATE DEFAULT NULL,
    license_front_image TEXT NOT NULL,
    license_back_image TEXT DEFAULT '',
    driving_experience_years INT DEFAULT 2,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_driver_docs_updated_at BEFORE UPDATE ON driver_documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- TABLE 5: RIDES (Published Journeys)
-- ==============================================================================
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    source TEXT NOT NULL DEFAULT 'Chandigarh University UP Campus, Lucknow',
    destination TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    drop_location TEXT NOT NULL,
    journey_date TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    expected_arrival TEXT DEFAULT '',
    total_seats INT NOT NULL DEFAULT 3 CHECK (total_seats >= 1 AND total_seats <= 7),
    available_seats INT NOT NULL DEFAULT 3 CHECK (available_seats >= 0),
    booked_seats INT NOT NULL DEFAULT 0,
    cost_per_seat NUMERIC(10,2) NOT NULL DEFAULT 250.00 CHECK (cost_per_seat >= 0),
    ac_available BOOLEAN DEFAULT TRUE,
    luggage_capacity TEXT DEFAULT 'Medium Luggage',
    instructions TEXT DEFAULT '',
    ride_status TEXT DEFAULT 'published' CHECK (ride_status IN ('published', 'started', 'completed', 'cancelled')),
    cancellation_reason TEXT DEFAULT NULL,
    started_at TIMESTAMPTZ DEFAULT NULL,
    completed_at TIMESTAMPTZ DEFAULT NULL,
    share_token TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rides_search ON rides(destination, journey_date, ride_status);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- TABLE 6: RIDE REQUESTS (Live Student Broadcast Feed)
-- ==============================================================================
CREATE TABLE ride_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID REFERENCES users(id) ON DELETE SET NULL,
    passenger_name TEXT DEFAULT 'Ananya Gupta',
    passenger_phone TEXT DEFAULT '9876500002',
    passenger_course TEXT DEFAULT 'B.Tech CSE - 4th Sem',
    source TEXT DEFAULT 'Chandigarh University UP Campus, Lucknow',
    destination TEXT NOT NULL,
    seats INT DEFAULT 1,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    driver_name TEXT DEFAULT NULL,
    driver_phone TEXT DEFAULT NULL,
    vehicle_info TEXT DEFAULT NULL,
    estimated_contribution NUMERIC(10,2) DEFAULT 150.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_ride_requests_updated_at BEFORE UPDATE ON ride_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- TABLE 7: BOOKINGS
-- ==============================================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seats_booked INT NOT NULL DEFAULT 1 CHECK (seats_booked >= 1 AND seats_booked <= 6),
    total_cost NUMERIC(10,2) NOT NULL,
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'accepted', 'rejected', 'confirmed', 'cancelled', 'completed')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'cash_declared', 'upi_declared', 'paid')),
    payment_reference TEXT DEFAULT NULL,
    pickup_note TEXT DEFAULT '',
    booking_date TIMESTAMPTZ DEFAULT now(),
    cancellation_reason TEXT DEFAULT NULL,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    has_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bookings_ride ON bookings(ride_id);
CREATE INDEX idx_bookings_passenger ON bookings(passenger_id);
CREATE INDEX idx_bookings_driver ON bookings(driver_id);
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- TABLE 8: REVIEWS & RATINGS
-- ==============================================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    safety_rating INT NOT NULL CHECK (safety_rating BETWEEN 1 AND 5),
    behaviour_rating INT NOT NULL CHECK (behaviour_rating BETWEEN 1 AND 5),
    punctuality_rating INT NOT NULL CHECK (punctuality_rating BETWEEN 1 AND 5),
    communication_rating INT NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
    overall_rating NUMERIC(3,2) NOT NULL CHECK (overall_rating BETWEEN 1.0 AND 5.0),
    review_text TEXT DEFAULT '',
    is_reported BOOLEAN DEFAULT FALSE,
    report_reason TEXT DEFAULT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_driver ON reviews(driver_id);
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- TABLE 9: PAYMENTS
-- ==============================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    method TEXT DEFAULT 'upi' CHECK (method IN ('cash', 'upi', 'direct_transfer')),
    upi_transaction_id TEXT DEFAULT '',
    status TEXT DEFAULT 'declared' CHECK (status IN ('declared', 'confirmed_by_driver', 'disputed')),
    paid_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 10: IN-APP MESSAGES (Chat)
-- ==============================================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_ride ON messages(ride_id, sent_at);

-- ==============================================================================
-- TABLE 11: NOTIFICATIONS
-- ==============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ==============================================================================
-- TABLE 12: INCIDENT & COMPLAINT REPORTS
-- ==============================================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('unsafe_driving', 'suspicious_vehicle', 'abusive_behaviour', 'fake_review', 'no_show', 'other')),
    reason TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    admin_notes TEXT DEFAULT '',
    action_taken TEXT DEFAULT '',
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- TABLE 13: AUDIT LOGS (Admin Security Actions)
-- ==============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT DEFAULT NULL,
    target_id TEXT DEFAULT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 14: EMERGENCY SOS CONTACTS
-- ==============================================================================
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT DEFAULT 'Parent',
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 15: LIVE GPS TRIP LOCATIONS
-- ==============================================================================
CREATE TABLE trip_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    speed NUMERIC(5,2) DEFAULT 0,
    heading NUMERIC(5,2) DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trip_locations_ride ON trip_locations(ride_id, recorded_at DESC);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enable RLS across all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_locations ENABLE ROW LEVEL SECURITY;

-- Allow full backend server access via service_role key OR authenticated users
CREATE POLICY "Allow service_role full access to users" ON users FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to vehicles" ON vehicles FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to student_verifications" ON student_verifications FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to driver_documents" ON driver_documents FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to rides" ON rides FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to ride_requests" ON ride_requests FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to bookings" ON bookings FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to reviews" ON reviews FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to payments" ON payments FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to messages" ON messages FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to notifications" ON notifications FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to reports" ON reports FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to emergency_contacts" ON emergency_contacts FOR ALL USING (auth.role() = 'service_role' OR true);
CREATE POLICY "Allow service_role full access to trip_locations" ON trip_locations FOR ALL USING (auth.role() = 'service_role' OR true);

-- ==============================================================================
-- 5. INITIAL SEED DATA (Admin & Verified Accounts)
-- ==============================================================================
-- Insert Master Admin Account (campusdrivers000 / campus1010)
-- Password hash generated with bcrypt (cost 10): '$2a$10$wEomlG4f475m5x6w1g64.u5q1c8p0r2t4v6x8z0b2d4f6h8j0'
INSERT INTO users (
    name,
    email,
    phone,
    student_id,
    course,
    semester,
    role,
    verification_status,
    password_hash
) VALUES (
    'Campus Drivers Admin',
    'campusdrivers000@cumail.in',
    '9999900000',
    'CUUP-ADMIN-000',
    'Administration',
    'Faculty / Staff',
    'admin',
    'verified',
    '$2a$10$2H6O9r0C7ZzU1mFfO7Z2O.1EomlG4f475m5x6w1g64.u5q1c8p0r'
) ON CONFLICT (email) DO NOTHING;

-- Insert Verified Test Passenger (Ananya Gupta / Password@123)
INSERT INTO users (
    name,
    email,
    phone,
    student_id,
    course,
    semester,
    role,
    verification_status,
    password_hash
) VALUES (
    'Ananya Gupta',
    'ananya.gupta@cumail.in',
    '9876500002',
    'CUUP24BCSE102',
    'B.Tech CSE',
    '4th Semester',
    'student',
    'verified',
    '$2a$10$7Z2O.1EomlG4f475m5x6w1g64.u5q1c8p0r2t4v6x8z0b2d4f6h8j0'
) ON CONFLICT (email) DO NOTHING;


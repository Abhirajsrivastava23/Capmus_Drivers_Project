# 🚗 Campus Drivers – Student Carpool & Ride Sharing Platform
### Designed Exclusively for Chandigarh University Uttar Pradesh (Lucknow Campus)

[![API Status](https://img.shields.io/badge/API-Online%20(Port%205001)-emerald)](http://localhost:5001/api/health)
[![Admin Dashboard](https://img.shields.io/badge/Admin%20Web-Live%20(Port%203000)-blue)](http://localhost:3000)
[![Mobile App](https://img.shields.io/badge/Mobile%20Expo-Live%20(Port%208081)-indigo)](http://localhost:8081)
[![Student Verified](https://img.shields.io/badge/Security-Verified%20Students%20Only-success)](http://localhost:5001/api/health)

---

## 📌 Executive Summary

**Campus Drivers** is a production-ready, student-only carpooling and journey cost-sharing platform engineered initially for **Chandigarh University Uttar Pradesh (Lucknow Campus)**. 

The application connects university students traveling from the CUUP Lucknow campus (NH-27 Highway) along the **Kanpur – Unnao – Lucknow** corridor with fellow students who have personal cars and available empty seats. 

> **Important Community Charter:** This is a verified student travel cost-sharing platform to split legitimate fuel expenses, **not a commercial taxi service**.

---

## 🌟 Key Functional Pillars

### 1. Dual-Role Architecture (Driver & Passenger in One Account)
Any student can seamlessly switch between offering rides (Driver) and booking rides (Passenger) within the same account without creating multiple profiles.

### 2. Chandigarh University ID & Verified Student Badge 🎓
- Strict role-based student validation: Only accounts with approved university student IDs can publish or book carpools.
- Displays an official emerald **Verified Student** badge across ride cards, profiles, and reviews.

### 3. Driver Profile Prioritizing Car & Driving Rating (Not Photos)
As specified, profile photographs are **not mandatory** and **not the primary factor** in evaluating drivers. The platform prioritizes:
- Full Legal Name & Verified University Roll ID
- UP Vehicle Registration Number (e.g. `UP32 AB 1234`) prominently displayed
- Car Make, Model & Color
- Total Completed Rides Count
- 5-Star Driving Experience Rating & Reviews

### 4. 5-Star Driving Experience Rating System ⭐
After every completed ride, confirmed passengers rate the driver across 5 distinct evaluation criteria:
1. **Driving Safety** (Adherence to speed limits on NH-27, no harsh braking)
2. **Driving Behaviour** (Courtesy, respect, music & cabin comfort)
3. **Punctuality** (Arrival time at university gate/pickup point)
4. **Communication** (Pickup coordination and status updates)
5. **Overall Experience**
- Passenger reviews are displayed on the driver's public profile.
- Built-in reporting system for fake or abusive reviews.

### 5. Atomic Seat Reservation (Double-Booking Prevention)
Bookings utilize atomic MongoDB operations (`available_seats: { $gte: seatsToBook }` with `$inc`) to prevent race conditions and overbooking. Once all seats are reserved, rides are automatically hidden from search results.

### 6. Student Phone Privacy & Contact Protection
Phone numbers are masked publicly (`987****001`) and are strictly unlocked and revealed **only after booking confirmation** between confirmed trip participants.

### 7. Live Journey & Emergency Safety
- **Emergency SOS:** High-contrast 1-tap SOS button alerting campus security, emergency contacts, and proctors with live GPS coordinates.
- **Helplines:** One-touch dialing for UP Police `112`, Women Power Line `1090`, and CUUP Campus Security (`+91 522 6688000`).
- **Real-Time In-App Chat:** Powered by Socket.IO for in-ride passenger-driver communication.
- **Trip Status Transitions:** `published` ➔ `started` (notifies passengers and starts tracking) ➔ `completed` (triggers review prompt) or `cancelled` (releases seats and notifies passengers).

---

## 🗄️ Database Architecture (14 MongoDB Collections)

All 14 collections specified in Section 13 are implemented with Mongoose models, validation, and compound indexes:

1. `users`: Student profile, university email, phone, roll ID, course, semester, verification status, role, emergency contact, driving statistics.
2. `student_verifications`: Roll number, ID card image records, course, semester, department, review status (`pending`, `approved`, `rejected`), admin notes.
3. `vehicles`: Car model, UP registration number (`UP32...`), color, vehicle type, AC status, luggage capacity, RC record, verification status.
4. `driver_documents`: Driving license number, expiry, license scans, driving experience years, admin verification.
5. `rides`: Driver ID, vehicle ref, source, destination, pickup point, drop point, journey date, exact departure time, expected arrival, available seats, booked seats, cost per seat (₹), luggage, AC, instructions, status (`published`, `started`, `completed`, `cancelled`), share token.
6. `bookings`: Ride ref, passenger ref, seats booked, total cost, booking status (`pending`, `accepted`, `rejected`, `confirmed`, `cancelled`, `completed`), payment status, declared payment reference.
7. `reviews`: Ride ref, booking ref (strictly unique to prevent duplicates), driver ref, passenger ref, safety rating, behaviour rating, punctuality rating, communication rating, overall rating, review text, reported flag.
8. `messages`: Ride ref, sender ref, receiver ref, message text, read status, timestamp.
9. `notifications`: User ref, title, body, notification type, reference data, read status.
10. `emergency_contacts`: User ref, contact name, relationship, phone number, primary flag.
11. `reports`: Reporter ref, reported user ref, ride ref, report type (`unsafe_driving`, `suspicious_vehicle`, `abusive_behaviour`, etc.), reason, details, investigation status, resolution.
12. `payments`: Booking ref, ride ref, passenger ref, driver ref, amount, method (`cash`, `upi`), UPI reference, status (`declared`, `confirmed`).
13. `trip_locations`: Ride ref, driver ref, latitude, longitude, speed, heading, timestamp.
14. `audit_logs`: Forensic audit records with user ID, action, entity type, IP address, user agent, details, timestamp.

---

## 📱 22 Main Mobile Application Screens

Built with React Native & Expo, styled with the official Navy/Blue/Emerald design language:

| # | Screen | Description |
|---|--------|-------------|
| 1 | **SplashScreen** | Campus Drivers animated branding, auto-auth check |
| 2 | **WelcomeScreen** | Value proposition, student-only carpooling, cost-sharing charter |
| 3 | **LoginScreen** | Email/Student ID/Phone + Password or instant mobile OTP |
| 4 | **StudentRegistrationScreen** | Roll number, university email, mobile, course, semester, emergency contact |
| 5 | **StudentVerificationScreen** | ID card upload, roll number verification, status banner |
| 6 | **HomeScreen** | Quick search, popular UP route chips, active ride feed, quick action matrix |
| 7 | **SearchRideScreen** | Origin, destination, journey date, seats needed, max cost, AC filter |
| 8 | **AvailableRidesScreen** | Search results with driver name, verified badge, vehicle model, UP plate, cost, ratings |
| 9 | **RideDetailsScreen** | Comprehensive itinerary, route timeline, vehicle specs, seat selector, request booking |
| 10 | **OfferRideScreen** | Publish trip: Destination, pickup, drop, departure time, seats, car info, cost per seat |
| 11 | **BookingConfirmationScreen** | Confirmed reservation, driver phone unlocked, call/chat buttons, declared UPI/Cash |
| 12 | **BookingRequestsScreen** | Driver view: Review incoming passenger requests, accept (atomic seat decrement) or decline |
| 13 | **MyBookingsScreen** | Passenger view: Active, confirmed, completed bookings, live tracking button, cancel seat |
| 14 | **MyPublishedRidesScreen** | Driver view: Change departure time, update seats, start ride, complete ride, cancel ride |
| 15 | **DriverProfileScreen** | Full driver profile prioritizing name, vehicle reg, completed trips, 5-star ratings (not photos) |
| 16 | **DrivingReviewsScreen** | 5-star evaluation form across Safety, Behaviour, Punctuality, Communication, Overall |
| 17 | **InAppChatScreen** | Real-time Socket.IO chat between confirmed driver and passenger |
| 18 | **NotificationsScreen** | Alerts for booking requests, acceptances, time changes, cancellations, SOS |
| 19 | **EmergencySOSScreen** | Big red emergency button, live GPS broadcast, instant dial 112, 1090 & CUUP security |
| 20 | **UserProfileScreen** | Academic profile, student ID status, registered car details, dual-role counters |
| 21 | **SettingsScreen** | Notifications, phone number masking controls, campus policy, logout |
| 22 | **HelpSupportScreen** | FAQs, safety guidelines, and Report Unsafe Driving / Suspicious Vehicle form |

---

## 💻 Secure Web-Based Admin Dashboard (Port 3000)

Accessible to university administrative and safety personnel:
- **Executive Overview:** Real-time metrics for registered students, verified drivers, active rides, open reports.
- **Student ID Verification:** Inspect submitted Chandigarh University student ID cards, verify or decline with feedback.
- **Drivers & UP Vehicles:** Verify driver licenses, vehicle models, and UP registration plates.
- **Rides Monitor:** Track all scheduled, in-progress, completed, and cancelled carpools across Uttar Pradesh.
- **Bookings & Seat Monitor:** Inspect seat counts, passenger details, and declared payment methods.
- **Complaints & Safety Desk:** Review reports of unsafe driving, suspicious vehicles, or misconduct; suspend or unblock accounts.
- **Reviews Moderation:** Audit 5-star driving feedback; hide or restore reported reviews.
- **Forensic Audit Logs:** Complete audit trail of administrative operations and system events.

---

## 🔑 Pre-Seeded Test Credentials

The database is pre-seeded with realistic Chandigarh University Uttar Pradesh students, vehicles, and active journeys:

| Role | Name | Email | Password | Details |
|------|------|-------|----------|---------|
| 👑 **Admin** | CUUP Admin | `admin@campusdrivers.cu.ac.in` | `Password@123` | Full Admin Dashboard Access |
| 🚗 **Driver** | Aarav Sharma | `aarav.sharma@cumail.in` | `Password@123` | **Vehicle:** Hyundai i10 (`UP32 AB 1234`), Rating: 4.9 ★ |
| 🚗 **Driver** | Priya Verma | `priya.verma@cumail.in` | `Password@123` | **Vehicle:** Maruti Swift (`UP32 BC 5678`), Rating: 4.8 ★ |
| 🚗 **Driver** | Rohan Tripathi | `rohan.tripathi@cumail.in` | `Password@123` | **Vehicle:** Honda City (`UP78 CK 9988`), Rating: 5.0 ★ |
| 🙋 **Passenger** | Ananya Gupta | `ananya.gupta@cumail.in` | `Password@123` | Verified Student, Active Booking on Kanpur ride |
| 🙋 **Passenger** | Devansh Singh | `devansh.singh@cumail.in` | `Password@123` | Verified Student (B.Tech CSE AI & ML) |

*For phone OTP verification in development mode, default OTP is `123456`.*

---

## 🚀 Running & Verification Instructions

### 1. Backend REST & Socket Server (Port 5001)
```bash
cd backend
npm install
npm run seed     # Seeds demo students, UP vehicles, rides & reviews
npm start        # Launches Express + Socket.IO on port 5001
npm test         # Runs the 10-step automated integration test suite
```

### 2. Web Admin Dashboard (Port 3000)
```bash
cd admin-web
npm install
npm run dev      # Opens at http://localhost:3000
npm run build    # Production build with Vite
```

### 3. Mobile Application (Port 8081)
```bash
cd mobile
npm install
npx expo start --web --port 8081    # Interactive web preview at http://localhost:8081
npx expo start                      # For iOS Simulator, Android Emulator, or Expo Go app
```

---

## 🧪 Automated Integration Test Verification

The backend test suite (`npm test` in `backend/`) validates the complete end-to-end carpool workflow:
```
🧪 Starting Campus Drivers Comprehensive Integration Test Suite...

✅ [1/10] Health Check: Status 200 -> Campus Drivers API
✅ [2/10] Driver Login: Status 200 -> Logged in as Aarav Sharma
✅ [3/10] Passenger Login: Status 200 -> Logged in as Ananya Gupta
✅ [4/10] Search Rides (Kanpur): Found 1 available ride(s)
       Target Ride: Chandigarh University UP Campus -> Kanpur (Car: Hyundai i10 Magna, Reg: UP32 AB 1234, Seats: 2)
✅ [5/10] Driver Offer Ride: Status 201 -> Ride offered to Varanasi Cantt
✅ [6/10] Passenger Booking Request: Status 201 -> Booking ID (pending)
✅ [7/10] Driver Accept Booking: Status 200 -> Remaining Seats on Ride: 2 (Atomic Seat Decrement)
✅ [8/10] Driver Complete Journey: Status 200 -> Ride marked completed!
✅ [9/10] 5-Star Driving Review Submission: Status 201 -> Review submitted
✅ [10/10] Admin Dashboard Overview: Status 200 -> Verified Students: 6, Total Rides: 5

======================================================
🎉 ALL 10 INTEGRATION TESTS PASSED WITH 100% SUCCESS!
======================================================
```

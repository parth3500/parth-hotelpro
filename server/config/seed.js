/**
 * Seed script for HotelPro — populates in-memory store (or MongoDB) with
 * realistic test data. Safe to re-run: checks existence before inserting.
 *
 * Usage: node server/config/seed.js
 *        Or import and call seed() from server startup.
 *
 * shortcut: bcrypt rounds=8 (fast for dev), raise to 12 in production
 */

'use strict';

const path = require('path');

// Point db.js at in-memory mode so seed works without a live MongoDB
process.env.USE_MEMORY_DB = process.env.USE_MEMORY_DB || 'true';

// Import via relative paths from this file's location (server/config/)
const { connectDB, getMemoryModel } = require('./db');

// Lazy-load bcryptjs — already a project dependency
let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch {
  console.error('[seed] bcryptjs not found. Run: npm install bcryptjs');
  process.exit(1);
}

// ── Model helpers (bypass createModel/proxy to write directly to in-memory) ──
// We load models normally so their schemas are registered with Mongoose too.
const {
  User, Hotel, Room, RoomCategory, Booking, Payment, Review,
  Guest, Staff
} = require('../models');

// ── Helpers ──────────────────────────────────────────────────────────────────

async function findOrCreate(Model, query, data) {
  const existing = await Model.findOne(query);
  if (existing) return { doc: existing, created: false };
  const doc = await Model.create(data);
  return { doc, created: true };
}

// ── Main seed function ────────────────────────────────────────────────────────

async function seed() {
  await connectDB();

  const HASH = await bcrypt.hash('Test@123', 8);

  // 1. Hotel ──────────────────────────────────────────────────────────────────
  const { doc: hotel, created: hotelCreated } = await findOrCreate(
    Hotel,
    { name: 'HotelPro Grand' },
    {
      name: 'HotelPro Grand',
      description: 'A premium 4-star hotel in the heart of New Delhi.',
      address: '12, Connaught Place',
      city: 'New Delhi',
      country: 'India',
      rating: 4,
      amenities: ['Free Wi-Fi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Parking'],
      contactEmail: 'stay@hotelprogrand.in',
      contactPhone: '+91-11-12345678',
      checkInTime: '14:00',
      checkOutTime: '11:00'
    }
  );
  console.log(`[seed] Hotel: ${hotelCreated ? 'created' : 'exists'} — ${hotel.name}`);

  // 2. Room Categories ────────────────────────────────────────────────────────
  const categories = [
    { name: 'Standard', description: 'Comfortable standard room', basePrice: 2000, capacity: 2, features: ['Wi-Fi', 'TV', 'AC'] },
    { name: 'Deluxe',   description: 'Spacious deluxe room',      basePrice: 4500, capacity: 2, features: ['Wi-Fi', 'TV', 'AC', 'Mini Bar', 'City View'] },
    { name: 'Suite',    description: 'Luxury suite with lounge',  basePrice: 8000, capacity: 3, features: ['Wi-Fi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Lounge'] }
  ];
  const createdCats = {};
  for (const cat of categories) {
    const { doc, created } = await findOrCreate(RoomCategory, { name: cat.name }, cat);
    createdCats[cat.name] = doc;
    console.log(`[seed] RoomCategory "${cat.name}": ${created ? 'created' : 'exists'}`);
  }

  // 3. Rooms (2 per category) ─────────────────────────────────────────────────
  const rooms = [
    { roomNumber: '101', category: 'Standard', pricePerNight: 2000, bedType: 'Double', floor: 1 },
    { roomNumber: '102', category: 'Standard', pricePerNight: 2200, bedType: 'Twin',   floor: 1 },
    { roomNumber: '201', category: 'Deluxe',   pricePerNight: 4500, bedType: 'King',   floor: 2 },
    { roomNumber: '202', category: 'Deluxe',   pricePerNight: 4800, bedType: 'King',   floor: 2 },
    { roomNumber: '301', category: 'Suite',    pricePerNight: 8000, bedType: 'King',   floor: 3 },
    { roomNumber: '302', category: 'Suite',    pricePerNight: 8000, bedType: 'King',   floor: 3 }
  ];
  const createdRooms = {};
  for (const r of rooms) {
    const { doc, created } = await findOrCreate(
      Room,
      { roomNumber: r.roomNumber },
      { ...r, hotelId: hotel._id.toString(), status: 'available', isActive: true }
    );
    createdRooms[r.roomNumber] = doc;
    console.log(`[seed] Room ${r.roomNumber}: ${created ? 'created' : 'exists'}`);
  }

  // 4. Users (Admin, Staff, Guest) ────────────────────────────────────────────
  const usersData = [
    { name: 'Admin User',   email: 'admin@hotelpro.com',  role: 'admin',  phone: '+91-9000000001' },
    { name: 'Staff Member', email: 'staff@hotelpro.com',  role: 'staff',  phone: '+91-9000000002', assignedDepartment: 'Reception' },
    { name: 'Guest Sharma', email: 'guest@hotelpro.com',  role: 'guest',  phone: '+91-9000000003' }
  ];
  const createdUsers = {};
  for (const u of usersData) {
    const { doc, created } = await findOrCreate(
      User,
      { email: u.email },
      { ...u, password: HASH, status: 'active' }
    );
    createdUsers[u.role] = doc;
    console.log(`[seed] User (${u.role}): ${created ? 'created' : 'exists'} — ${u.email}`);
  }

  // 5. Staff profile ──────────────────────────────────────────────────────────
  const { created: staffProfileCreated } = await findOrCreate(
    Staff,
    { userId: createdUsers.staff._id.toString() },
    {
      userId: createdUsers.staff._id.toString(),
      department: 'Reception',
      shift: 'Morning',
      assignedHotelId: hotel._id.toString(),
      isActive: true
    }
  );
  console.log(`[seed] Staff profile: ${staffProfileCreated ? 'created' : 'exists'}`);

  // 6. Guest profile ──────────────────────────────────────────────────────────
  const { created: guestProfileCreated } = await findOrCreate(
    Guest,
    { userId: createdUsers.guest._id.toString() },
    {
      userId: createdUsers.guest._id.toString(),
      preferences: 'High floor, non-smoking',
      specialRequests: 'Extra pillows',
      loyaltyPoints: 150,
      totalStays: 2
    }
  );
  console.log(`[seed] Guest profile: ${guestProfileCreated ? 'created' : 'exists'}`);

  // 7. Bookings ───────────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const pastCheckIn  = '2024-10-01';
  const pastCheckOut = '2024-10-04';

  const { doc: upcomingBooking, created: b1Created } = await findOrCreate(
    Booking,
    { bookingReference: 'BKG-UPCOMING-001' },
    {
      bookingReference: 'BKG-UPCOMING-001',
      userId: createdUsers.guest._id.toString(),
      guestName: createdUsers.guest.name,
      guestEmail: createdUsers.guest.email,
      guestPhone: createdUsers.guest.phone || '',
      roomId: createdRooms['201']._id.toString(),
      roomNumber: '201',
      roomCategory: 'Deluxe',
      checkInDate: tomorrow.toISOString().split('T')[0],
      checkOutDate: dayAfter.toISOString().split('T')[0],
      totalNights: 2,
      guestsCount: 2,
      totalAmount: 9000,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: 'Early check-in if possible'
    }
  );
  console.log(`[seed] Booking (upcoming): ${b1Created ? 'created' : 'exists'} — ${upcomingBooking.bookingReference}`);

  const { doc: completedBooking, created: b2Created } = await findOrCreate(
    Booking,
    { bookingReference: 'BKG-COMPLETED-001' },
    {
      bookingReference: 'BKG-COMPLETED-001',
      userId: createdUsers.guest._id.toString(),
      guestName: createdUsers.guest.name,
      guestEmail: createdUsers.guest.email,
      guestPhone: createdUsers.guest.phone || '',
      roomId: createdRooms['101']._id.toString(),
      roomNumber: '101',
      roomCategory: 'Standard',
      checkInDate: pastCheckIn,
      checkOutDate: pastCheckOut,
      totalNights: 3,
      guestsCount: 1,
      totalAmount: 6000,
      status: 'checked_out',
      paymentStatus: 'paid',
      specialRequests: ''
    }
  );
  console.log(`[seed] Booking (completed): ${b2Created ? 'created' : 'exists'} — ${completedBooking.bookingReference}`);

  // 8. Payment for completed booking ─────────────────────────────────────────
  const { created: payCreated } = await findOrCreate(
    Payment,
    { transactionId: 'TXN-SEED-001' },
    {
      bookingId: completedBooking._id.toString(),
      userId: createdUsers.guest._id.toString(),
      amount: 6000,
      currency: 'INR',
      paymentMethod: 'card',
      transactionId: 'TXN-SEED-001',
      status: 'success',
      invoiceNumber: 'INV-SEED-001',
      subtotal: 6000,
      tax: 1080,    // 18% GST
      serviceFee: 0,
      discount: 0,
      refundAmount: 0
    }
  );
  console.log(`[seed] Payment: ${payCreated ? 'created' : 'exists'}`);

  // 9. Review for completed booking ──────────────────────────────────────────
  const { created: revCreated } = await findOrCreate(
    Review,
    { userId: createdUsers.guest._id.toString(), roomId: createdRooms['101']._id.toString() },
    {
      userId: createdUsers.guest._id.toString(),
      userName: createdUsers.guest.name,
      roomId: createdRooms['101']._id.toString(),
      rating: 4,
      comment: 'Great stay, clean room and helpful staff. Would come back!',
      staffResponse: null
    }
  );
  console.log(`[seed] Review: ${revCreated ? 'created' : 'exists'}`);

  console.log('\n[seed] ✅ Done. HotelPro data is ready.');
  return { hotel, createdUsers, createdRooms };
}

// ── Standalone entry point ────────────────────────────────────────────────────
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(err => { console.error('[seed] Error:', err); process.exit(1); });
}

module.exports = { seed };

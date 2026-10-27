const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Room = require('../src/models/Room');
const connectDB = require('../src/config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany();
    await Room.deleteMany();

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@hotelpro.com',
      password: 'admin123',
      role: 'admin',
    });

    const customerUser = await User.create({
      name: 'John Doe',
      email: 'customer@hotelpro.com',
      password: 'customer123',
      role: 'customer',
    });

    const rooms = [
      {
        roomNumber: '101',
        name: 'Presidential Ocean Suite',
        type: 'suite',
        pricePerNight: 450,
        price: 450,
        capacity: 4,
        size: '85 m²',
        bed: '1 King Bed & Sofa Bed',
        rating: 4.9,
        reviewsCount: 42,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
        ],
        amenities: ['Ocean View', 'Jacuzzi', 'Free Wi-Fi', 'Mini Bar', 'Butler Service', 'Air Conditioning', 'Smart TV', 'Safe'],
        description: 'Experience ultimate luxury in our Presidential Ocean Suite. Featuring panoramic ocean views, private balcony, marble bathroom with jacuzzi, and 24/7 dedicated butler service.',
        isAvailable: true,
      },
      {
        roomNumber: '102',
        name: 'Deluxe King Room',
        type: 'deluxe',
        pricePerNight: 220,
        price: 220,
        capacity: 2,
        size: '42 m²',
        bed: '1 King Bed',
        rating: 4.7,
        reviewsCount: 88,
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
        ],
        amenities: ['City View', 'Free Wi-Fi', 'Mini Bar', 'Air Conditioning', 'Smart TV', 'Safe', 'Coffee Maker'],
        description: 'Designed for comfort and elegance, our Deluxe King Room offers plush bedding, a work desk, city or garden views, and modern rain shower facilities.',
        isAvailable: true,
      },
      {
        roomNumber: '201',
        name: 'Executive Twin Room',
        type: 'executive',
        pricePerNight: 260,
        price: 260,
        capacity: 3,
        size: '48 m²',
        bed: '2 Queen Beds',
        rating: 4.8,
        reviewsCount: 64,
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        ],
        amenities: ['Pool View', 'Free Wi-Fi', 'Work Desk', 'Air Conditioning', 'Smart TV', 'Safe', 'Mini Bar'],
        description: 'Spacious twin room ideal for colleagues or small families. Features high-speed internet, ergonomic workstations, and premium bath amenities.',
        isAvailable: true,
      },
      {
        roomNumber: '202',
        name: 'Standard Queen Room',
        type: 'standard',
        pricePerNight: 140,
        price: 140,
        capacity: 2,
        size: '30 m²',
        bed: '1 Queen Bed',
        rating: 4.5,
        reviewsCount: 120,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        ],
        amenities: ['Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'Safe', 'Hairdryer'],
        description: 'Cozy and affordable without compromising on quality. Perfect for solo travelers or couples looking for a comfortable retreat after exploring the city.',
        isAvailable: true,
      },
    ];

    await Room.insertMany(rooms);
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedData();

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const seedDefaultsIfEmpty = async () => {
  try {
    const Room = require('../models/Room');
    const User = require('../models/User');

    const count = await Room.countDocuments();
    if (count === 0) {
      console.log('Database empty. Seeding initial rooms and users...');
      await User.create([
        {
          name: 'Admin User',
          email: 'admin@hotelpro.com',
          password: 'admin123',
          role: 'admin',
        },
        {
          name: 'John Doe',
          email: 'customer@hotelpro.com',
          password: 'customer123',
          role: 'customer',
        },
      ]);

      await Room.insertMany([
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
      ]);
      console.log('Initial data seeded successfully.');
    }
  } catch (err) {
    console.warn('Auto-seed notice:', err.message);
  }
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (uri) {
      try {
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
        console.log(`MongoDB Connected (Atlas/Custom): ${conn.connection.host}`);
        await seedDefaultsIfEmpty();
        return conn;
      } catch (err) {
        console.warn(`Could not connect to remote MONGO_URI (${err.message}). Trying local database...`);
      }
    }

    const localUri = process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/hotelpro';
    try {
      const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
      console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
      await seedDefaultsIfEmpty();
      return conn;
    } catch (err) {
      console.log('Local MongoDB not active. Starting in-memory MongoDB server...');
    }

    const binaryOpts = { version: '7.0.14' };
    if (process.platform === 'linux') {
      binaryOpts.os = { os: 'linux', dist: 'rhel', release: '9.0' };
    }

    mongoServer = await MongoMemoryServer.create({ binary: binaryOpts });
    uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
    await seedDefaultsIfEmpty();
    return conn;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const cleanupMongoose = async () => {
  try {
    if (mongoServer) {
      await mongoServer.stop();
    }
    await mongoose.disconnect();
  } catch (e) {}
};

process.on('SIGINT', cleanupMongoose);
process.on('SIGTERM', cleanupMongoose);

module.exports = connectDB;

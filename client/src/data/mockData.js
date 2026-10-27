export const initialRooms = [
  {
    id: 1,
    name: "Presidential Ocean Suite",
    type: "Suite",
    price: 450,
    capacity: 4,
    size: "85 m²",
    bed: "1 King Bed & Sofa Bed",
    rating: 4.9,
    reviewsCount: 42,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Experience ultimate luxury in our Presidential Ocean Suite. Featuring panoramic ocean views, private balcony, marble bathroom with jacuzzi, and 24/7 dedicated butler service.",
    amenities: ["Ocean View", "Jacuzzi", "Free Wi-Fi", "Mini Bar", "Butler Service", "Air Conditioning", "Smart TV", "Safe"]
  },
  {
    id: 2,
    name: "Deluxe King Room",
    type: "Deluxe",
    price: 220,
    capacity: 2,
    size: "42 m²",
    bed: "1 King Bed",
    rating: 4.7,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Designed for comfort and elegance, our Deluxe King Room offers plush bedding, a work desk, city or garden views, and modern rain shower facilities.",
    amenities: ["City View", "Free Wi-Fi", "Mini Bar", "Air Conditioning", "Smart TV", "Safe", "Coffee Maker"]
  },
  {
    id: 3,
    name: "Executive Twin Room",
    type: "Executive",
    price: 260,
    capacity: 3,
    size: "48 m²",
    bed: "2 Queen Beds",
    rating: 4.8,
    reviewsCount: 64,
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Spacious twin room ideal for colleagues or small families. Features high-speed internet, ergonomic workstations, and premium bath amenities.",
    amenities: ["Pool View", "Free Wi-Fi", "Work Desk", "Air Conditioning", "Smart TV", "Safe", "Mini Bar"]
  },
  {
    id: 4,
    name: "Standard Queen Room",
    type: "Standard",
    price: 140,
    capacity: 2,
    size: "30 m²",
    bed: "1 Queen Bed",
    rating: 4.5,
    reviewsCount: 120,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Cozy and affordable without compromising on quality. Perfect for solo travelers or couples looking for a comfortable retreat after exploring the city.",
    amenities: ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Safe", "Hairdryer"]
  },
  {
    id: 5,
    name: "Penthouse Royal Suite",
    type: "Suite",
    price: 650,
    capacity: 6,
    size: "120 m²",
    bed: "2 King Beds & 2 Single Beds",
    rating: 5.0,
    reviewsCount: 19,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
    ],
    description: "The pinnacle of luxury living. Bi-level penthouse with private rooftop terrace, infinity plunge pool, full kitchen, and VIP lounge access.",
    amenities: ["Rooftop Terrace", "Private Pool", "Kitchen", "Butler Service", "Free Wi-Fi", "Jacuzzi", "Smart TV"]
  },
  {
    id: 6,
    name: "Classic Double Room",
    type: "Standard",
    price: 170,
    capacity: 2,
    size: "35 m²",
    bed: "1 Double Bed",
    rating: 4.6,
    reviewsCount: 55,
    image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Comfortable classic double room with warm decor, modern en-suite bathroom, and all essential amenities for a pleasant stay.",
    amenities: ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Mini Bar", "Safe"]
  }
];

export const initialBookings = [
  {
    id: "BK-9821",
    roomName: "Presidential Ocean Suite",
    roomId: 1,
    guestName: "Alice Johnson",
    guestEmail: "alice@example.com",
    checkIn: "2026-11-10",
    checkOut: "2026-11-15",
    guests: 2,
    totalPrice: 2250,
    status: "Confirmed",
    paymentMethod: "Credit Card",
    createdAt: "2026-10-20"
  },
  {
    id: "BK-9822",
    roomName: "Deluxe King Room",
    roomId: 2,
    guestName: "Bob Smith",
    guestEmail: "bob@example.com",
    checkIn: "2026-11-12",
    checkOut: "2026-11-14",
    guests: 1,
    totalPrice: 440,
    status: "Confirmed",
    paymentMethod: "PayPal",
    createdAt: "2026-10-22"
  },
  {
    id: "BK-9823",
    roomName: "Standard Queen Room",
    roomId: 4,
    guestName: "Charlie Brown",
    guestEmail: "charlie@example.com",
    checkIn: "2026-10-01",
    checkOut: "2026-10-05",
    guests: 2,
    totalPrice: 560,
    status: "Completed",
    paymentMethod: "Credit Card",
    createdAt: "2026-09-15"
  }
];

export const initialStaff = [
  { id: 1, name: "Sarah Jenkins", role: "Front Desk Manager", department: "Front Office", email: "sarah@hotelpro.com", status: "Active" },
  { id: 2, name: "Michael Chang", role: "Head Concierge", department: "Guest Services", email: "michael@hotelpro.com", status: "Active" },
  { id: 3, name: "Elena Rostova", role: "Executive Housekeeper", department: "Housekeeping", email: "elena@hotelpro.com", status: "Active" },
  { id: 4, name: "David Miller", role: "Maintenance Supervisor", department: "Engineering", email: "david@hotelpro.com", status: "On Leave" }
];

export const testimonials = [
  {
    id: 1,
    name: "Jessica Taylor",
    role: "Travel Blogger",
    comment: "HotelPro exceeded all expectations! The Presidential Suite offered breathtaking views and the staff anticipated our every need.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 2,
    name: "Marcus Vance",
    role: "Business Executive",
    comment: "Seamless booking, pristine rooms, and lightning-fast Wi-Fi. My go-to hotel whenever I visit the city for conferences.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 3,
    name: "Sophia Martinez",
    role: "Family Vacationer",
    comment: "The kids loved the pool and the spacious Executive Twin room. Exceptional hospitality from check-in to checkout.",
    rating: 4.8,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  }
];

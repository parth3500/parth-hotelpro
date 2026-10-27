import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialRooms, initialBookings, initialStaff } from '../data/mockData';

const HotelContext = createContext();

export const HotelProvider = ({ children }) => {
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('hotelpro_rooms');
    return saved ? JSON.parse(saved) : initialRooms;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('hotelpro_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('hotelpro_staff');
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [user, setUser] = useState({
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    role: "Guest" // Guest or Admin
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingDraft, setBookingDraft] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem('hotelpro_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('hotelpro_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('hotelpro_staff', JSON.stringify(staff));
  }, [staff]);

  // Sync rooms from backend API if available
  useEffect(() => {
    let isMounted = true;
    fetch('/api/rooms')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (isMounted && data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setRooms(prev => {
            const apiRooms = data.data.map(r => ({
              ...r,
              id: r._id || r.id,
              price: r.price || r.pricePerNight || 100,
              pricePerNight: r.pricePerNight || r.price || 100,
              name: r.name || `Room ${r.roomNumber || ''}`,
              capacity: r.capacity || 2,
              type: r.type ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : 'Standard',
              image: r.image || 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
              images: r.images && r.images.length > 0 ? r.images : [r.image || 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'],
              amenities: r.amenities || ['Free Wi-Fi', 'Air Conditioning', 'Smart TV'],
              description: r.description || 'Comfortable hotel accommodation.',
              rating: r.rating || 4.8,
              reviewsCount: r.reviewsCount || 10,
              size: r.size || '35 m²',
              bed: r.bed || '1 King Bed',
            }));
            // Merge with local newly created rooms if any
            const existingIds = new Set(apiRooms.map(r => String(r.id)));
            const extraLocal = prev.filter(r => !existingIds.has(String(r.id)));
            return [...apiRooms, ...extraLocal];
          });
        }
      })
      .catch(() => {
        // Fallback to local storage / mock data gracefully
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const addBooking = (bookingData) => {
    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      ...bookingData
    };
    setBookings(prev => [newBooking, ...prev]);
    showToast(`Booking ${newBooking.id} confirmed successfully!`);
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setBookings(prev => prev.map(b => (b.id === bookingId || b._id === bookingId) ? { ...b, status: 'Cancelled' } : b));
    showToast(`Booking ${bookingId} has been cancelled.`);
  };

  const addRoom = async (roomData) => {
    const newRoom = { id: Date.now(), rating: 5.0, reviewsCount: 1, images: [roomData.image], ...roomData };
    setRooms(prev => [newRoom, ...prev]);
    showToast(`Room "${newRoom.name}" added successfully.`);

    try {
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: roomData.roomNumber || `RM-${Date.now().toString().slice(-4)}`,
          name: roomData.name,
          type: (roomData.type || 'deluxe').toLowerCase(),
          pricePerNight: Number(roomData.price),
          price: Number(roomData.price),
          capacity: Number(roomData.capacity),
          amenities: roomData.amenities,
          description: roomData.description,
          image: roomData.image,
          images: [roomData.image],
        }),
      });
    } catch {
      // Local state is already updated
    }
  };

  const updateRoom = (updatedRoom) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    showToast(`Room updated successfully.`);
  };

  const deleteRoom = (roomId) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
    showToast(`Room removed successfully.`);
  };

  const addStaff = (staffData) => {
    const newStaff = { id: Date.now(), ...staffData };
    setStaff(prev => [...prev, newStaff]);
    showToast(`Staff member "${newStaff.name}" added.`);
  };

  const deleteStaff = (staffId) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
    showToast(`Staff member removed.`);
  };

  const toggleUserRole = () => {
    setUser(prev => {
      const nextRole = prev.role === 'Guest' ? 'Admin' : 'Guest';
      showToast(`Switched role to ${nextRole}`);
      return {
        ...prev,
        role: nextRole
      };
    });
  };

  return (
    <HotelContext.Provider value={{
      rooms, bookings, staff, user, setUser,
      selectedRoom, setSelectedRoom,
      bookingDraft, setBookingDraft,
      toastMessage, showToast,
      addBooking, cancelBooking,
      addRoom, updateRoom, deleteRoom,
      addStaff, deleteStaff, toggleUserRole
    }}>
      {children}
    </HotelContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHotel = () => useContext(HotelContext);

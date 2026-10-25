import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Public pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

// Guest pages
import GuestDashboard from './pages/guest/Dashboard'
import RoomListing from './pages/guest/RoomListing'
import RoomDetail from './pages/guest/RoomDetail'
import BookingForm from './pages/guest/BookingForm'
import BookingHistory from './pages/guest/BookingHistory'
import Reviews from './pages/guest/Reviews'
import Notifications from './pages/guest/Notifications'

// Staff pages
import StaffDashboard from './pages/staff/Dashboard'
import CheckInOut from './pages/staff/CheckInOut'
import Housekeeping from './pages/staff/Housekeeping'
import ServiceRequests from './pages/staff/ServiceRequests'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import RoomManagement from './pages/admin/RoomManagement'
import BookingMonitor from './pages/admin/BookingMonitor'
import Reports from './pages/admin/Reports'

export default function App() {
  return (
    <ErrorBoundary>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Guest */}
        <Route element={<ProtectedRoute roles={['guest', 'admin', 'staff']} />}>
          <Route path="/rooms" element={<RoomListing />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
        </Route>
        <Route element={<ProtectedRoute roles={['guest']} />}>
          <Route path="/guest/dashboard" element={<GuestDashboard />} />
          <Route path="/guest/book/:roomId" element={<BookingForm />} />
          <Route path="/guest/bookings" element={<BookingHistory />} />
          <Route path="/guest/reviews" element={<Reviews />} />
          <Route path="/guest/notifications" element={<Notifications />} />
        </Route>

        {/* Staff */}
        <Route element={<ProtectedRoute roles={['staff', 'admin']} />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/checkinout" element={<CheckInOut />} />
          <Route path="/staff/housekeeping" element={<Housekeeping />} />
          <Route path="/staff/service-requests" element={<ServiceRequests />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/rooms" element={<RoomManagement />} />
          <Route path="/admin/bookings" element={<BookingMonitor />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

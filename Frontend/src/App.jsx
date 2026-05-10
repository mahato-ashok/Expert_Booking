import { Routes, Route } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext.jsx'
import Navbar from './components/Navbar.jsx'
import ExpertListPage from './pages/ExpertListPage.jsx'
import ExpertDetailPage from './pages/ExpertDetailPage.jsx'
import BookingPage from './pages/BookingPage.jsx'
import MyBookingsPage from './pages/MyBookingsPage.jsx'

export default function App() {
  return (
    <SocketProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<ExpertListPage />} />
            <Route path="/experts/:id" element={<ExpertDetailPage />} />
            <Route path="/book/:expertId" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
          </Routes>
        </main>
      </div>
    </SocketProvider>
  )
}

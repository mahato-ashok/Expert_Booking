import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

/* ── Experts ── */

export const getExperts = (params) =>
  api.get('/experts', { params }).then((r) => r.data)

export const getExpert = (id) =>
  api.get(`/experts/${id}`).then((r) => r.data)

/* ── Bookings ── */

export const createBooking = (data) =>
  api.post('/bookings', data).then((r) => r.data)

export const getMyBookings = (email) =>
  api.get('/bookings', { params: { email } }).then((r) => r.data)

export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status }).then((r) => r.data)

export default api

# Expert Booking — Backend

Node.js + Express + MongoDB + Socket.io API for the Expert Session Booking System.

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set MONGO_URI if using Atlas

# 3. Seed the database with 12 sample experts
npm run seed

# 4. Start development server
npm run dev
```

Server starts at: http://localhost:5000

## Folder structure

```
├── server.js                 ← Entry point (Express + Socket.io)
├── config/
│   └── db.js                 ← MongoDB connection
├── models/
│   ├── Expert.js             ← Expert schema + availableSlots
│   └── Booking.js            ← Booking schema + compound unique index
├── controllers/
│   ├── expertController.js   ← GET /experts, GET /experts/:id
│   └── bookingController.js  ← POST, GET, PATCH /bookings
├── routes/
│   ├── expertRoutes.js
│   └── bookingRoutes.js
├── middleware/
│   ├── errorHandler.js       ← Global error handler + asyncHandler
│   └── validators.js         ← express-validator rules
└── seed/
    └── seed.js               ← 12 realistic experts with future slots
```

## API Reference

### Experts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/experts` | List experts (paginated, filterable) |
| GET | `/experts/:id` | Single expert with all slots |

**GET /experts — Query params**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Per page 1–50 (default: 9) |
| category | string | Technology, Business, Design, Health, Education, Marketing, Finance, Legal |
| search | string | Partial name search (case-insensitive) |

**Example response — GET /experts**
```json
{
  "success": true,
  "experts": [...],
  "total": 12,
  "page": 1,
  "totalPages": 2,
  "limit": 9
}
```

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings` | Create a booking (race-condition safe) |
| GET | `/bookings?email=` | Get bookings by email |
| PATCH | `/bookings/:id/status` | Update booking status |

**POST /bookings — Request body**
```json
{
  "expertId": "664abc...",
  "name": "Aarav Sharma",
  "email": "aarav@email.com",
  "phone": "9876543210",
  "date": "2025-06-01",
  "timeSlot": "10:00 AM",
  "notes": "Want to discuss system design"
}
```

**PATCH /bookings/:id/status — Request body**
```json
{ "status": "confirmed" }
```
Valid statuses: `pending` → `confirmed` → `completed`

### Health check

```
GET /health
```

## Real-time (Socket.io)

The server uses Socket.io rooms named after expert IDs.

| Event | Direction | Payload |
|-------|-----------|---------|
| `join-expert` | Client → Server | `expertId` string |
| `leave-expert` | Client → Server | `expertId` string |
| `slot-booked` | Server → Client | `{ expertId, date, timeSlot }` |

When a booking is created via `POST /bookings`, the server emits
`slot-booked` to all clients in that expert's room, so their UI
updates instantly without polling.

## Double booking prevention

Two layers of protection:

1. **Atomic findOneAndUpdate** — the slot is only marked `isBooked: true`
   if it was `isBooked: false` at query time. This happens inside a
   MongoDB session/transaction with the Booking insert.

2. **Compound unique index** on `{ expertId, date, timeSlot }` in the
   Booking model. Even if two requests somehow bypass layer 1, MongoDB
   rejects the second insert with error code 11000, which returns a
   `409 Conflict` to the client.

## Error codes

| Code | Meaning |
|------|---------|
| 400 | Validation error or bad request |
| 404 | Resource not found |
| 409 | Slot already booked (double booking attempt) |
| 422 | express-validator failed |
| 500 | Internal server error |

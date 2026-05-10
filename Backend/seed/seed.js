import 'dotenv/config'
import mongoose from 'mongoose'
import Expert from '../models/Expert.js'
import Booking from '../models/Booking.js'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expert-booking'

// Generate time slots for the next N days
function generateSlots(daysAhead = 14, timesPerDay = 5) {
  const times = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM']
  const slots = []
  for (let d = 1; d <= daysAhead; d++) {
    const date = new Date()
    date.setDate(date.getDate() + d)
    const dateStr = date.toISOString().slice(0, 10)
    times.slice(0, timesPerDay).forEach((time) => {
      slots.push({ date: dateStr, time, isBooked: false })
    })
  }
  return slots
}

const experts = [
  {
    name: 'Priya Mehta',
    category: 'Technology',
    experience: 12,
    rating: 4.9,
    bio: 'Senior software architect with 12 years at top tech companies. Specialises in distributed systems, cloud architecture, and scalable API design. Has mentored over 200 engineers.',
    availableSlots: generateSlots(14, 4),
  },
  {
    name: 'Arjun Kapoor',
    category: 'Business',
    experience: 15,
    rating: 4.7,
    bio: 'Former McKinsey consultant and startup founder with two successful exits. Expert in business strategy, fundraising, and scaling operations from seed to Series B.',
    availableSlots: generateSlots(14, 3),
  },
  {
    name: 'Sneha Iyer',
    category: 'Design',
    experience: 8,
    rating: 4.8,
    bio: 'Lead UX designer at a Fortune 500 company. Specialises in design systems, user research, and product thinking. Passionate about inclusive design and accessibility.',
    availableSlots: generateSlots(12, 4),
  },
  {
    name: 'Dr. Rahul Verma',
    category: 'Health',
    experience: 20,
    rating: 4.9,
    bio: 'MBBS, MD (AIIMS). Specialist in preventive medicine and lifestyle disorders. Conducts wellness consultations focused on holistic health, nutrition, and mental well-being.',
    availableSlots: generateSlots(10, 3),
  },
  {
    name: 'Kavya Nair',
    category: 'Education',
    experience: 10,
    rating: 4.6,
    bio: 'IIT graduate and edtech entrepreneur. Has helped over 1,000 students crack IIT-JEE, UPSC, and MBA entrances. Expert in learning strategy and cognitive performance.',
    availableSlots: generateSlots(14, 5),
  },
  {
    name: 'Rohan Desai',
    category: 'Marketing',
    experience: 9,
    rating: 4.5,
    bio: 'Growth marketing expert who has scaled D2C brands from 0 to ₹100Cr. Specialises in performance marketing, brand building, and go-to-market strategy.',
    availableSlots: generateSlots(14, 4),
  },
  {
    name: 'Ananya Sharma',
    category: 'Finance',
    experience: 14,
    rating: 4.8,
    bio: 'Chartered Accountant and SEBI-registered investment advisor. Expert in personal finance, tax planning, equity research, and building long-term wealth portfolios.',
    availableSlots: generateSlots(14, 3),
  },
  {
    name: 'Vikram Bose',
    category: 'Legal',
    experience: 18,
    rating: 4.7,
    bio: 'Senior advocate with expertise in corporate law, startup compliance, IP rights, and commercial contracts. Has represented clients at the Supreme Court and various High Courts.',
    availableSlots: generateSlots(10, 3),
  },
  {
    name: 'Deepika Rao',
    category: 'Technology',
    experience: 7,
    rating: 4.6,
    bio: 'Full-stack engineer and open source contributor. Specialises in React, Node.js, and AI/ML integration. Runs a popular YouTube channel on modern web development.',
    availableSlots: generateSlots(14, 5),
  },
  {
    name: 'Sameer Gupta',
    category: 'Business',
    experience: 11,
    rating: 4.4,
    bio: 'Serial entrepreneur and angel investor. Has invested in 30+ startups. Expert in business model design, product-market fit, and early-stage funding strategies.',
    availableSlots: generateSlots(12, 3),
  },
  {
    name: 'Meera Pillai',
    category: 'Design',
    experience: 6,
    rating: 4.5,
    bio: 'Brand identity designer who has worked with over 80 companies across India and the Middle East. Expert in visual storytelling, logo design, and brand strategy.',
    availableSlots: generateSlots(14, 4),
  },
  {
    name: 'Nikhil Joshi',
    category: 'Finance',
    experience: 16,
    rating: 4.9,
    bio: 'Ex-Goldman Sachs analyst and certified CFP. Helps HNIs and salaried professionals build tax-efficient investment portfolios. Specialises in real estate and equity planning.',
    availableSlots: generateSlots(14, 3),
  },
]

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await Expert.deleteMany({})
    await Booking.deleteMany({})
    console.log('Cleared existing data')

    // Insert experts
    const inserted = await Expert.insertMany(experts)
    console.log(`Seeded ${inserted.length} experts`)

    console.log('\nExperts seeded:')
    inserted.forEach((e) => console.log(`  - ${e.name} (${e.category}) — ${e.availableSlots.length} slots`))

    console.log('\nSeed complete! You can now start the server.')
    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err.message)
    process.exit(1)
  }
}

seed()

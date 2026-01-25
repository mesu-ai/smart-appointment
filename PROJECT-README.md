# SmartQueue - Appointment & Queue Manager

A comprehensive Next.js application for managing appointments and queues efficiently with real-time updates.

## Features

### 🎯 Core Features
- **Appointment Booking System**: Schedule appointments with preferred date, time, and service
- **Queue Management**: Join and manage queues with real-time position tracking
- **Admin Dashboard**: Comprehensive dashboard to manage appointments and queue
- **Real-time Updates**: Live queue status and position updates
- **Multiple Services**: Support for different service types with varying durations and prices

### 📋 User Features
- Book appointments by selecting service, date, and time
- Join queue for walk-in services
- View queue position and estimated wait time
- Get confirmation with appointment details
- User-friendly interface with step-by-step booking process

### 👨‍💼 Admin Features
- View all appointments and their status
- Manage queue in real-time
- Serve customers systematically
- Mark appointments as completed or cancelled
- Track statistics and performance metrics
- Update queue status (waiting, serving, completed, cancelled)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd smart-appointment
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
smart-appointment/
├── src/
│   ├── app/
│   │   ├── admin/         # Admin dashboard page
│   │   ├── book/          # Appointment booking page
│   │   ├── queue/         # Queue management page
│   │   ├── layout.js      # Root layout with providers
│   │   ├── page.js        # Landing page
│   │   └── globals.css    # Global styles
│   └── context/
│       └── AppointmentContext.js  # Global state management
├── public/                # Static assets
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Available Pages

### 1. Home Page (`/`)
- Landing page with navigation
- Overview of features
- Quick access to booking and queue

### 2. Book Appointment (`/book`)
5-step booking process:
1. Select service
2. Choose date
3. Pick time slot
4. Enter personal information
5. Confirmation

### 3. Queue Status (`/queue`)
- Real-time queue display
- Join queue functionality
- Personal queue ticket view
- Estimated wait time

### 4. Admin Dashboard (`/admin`)
- Statistics overview
- Appointment management
- Queue control
- Serve next customer
- Complete/cancel operations

## Services Available

1. **General Consultation** - 30 min - $50
2. **Medical Check-up** - 45 min - $75
3. **Dental Care** - 60 min - $100
4. **Eye Examination** - 30 min - $60

## Data Storage

- Uses browser localStorage for data persistence
- Data persists across page refreshes
- Appointments and queue entries are stored locally

## Technologies Used

- **Framework**: Next.js 16.1.4
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State Management**: React Context API

## Features Breakdown

### Appointment System
- Date picker with next 7 days available
- Time slot generation (9:00 AM - 5:00 PM)
- 30-minute intervals
- Automatic slot blocking for booked times
- Service selection with duration and price
- Email and phone collection
- Unique appointment ID generation

### Queue System
- Position-based queue management
- Estimated wait time calculation (15 min per person)
- Real-time position updates
- Queue status tracking
- Ticket generation
- Join queue with service selection

### Admin Controls
- Dashboard statistics
  - Total appointments
  - Current queue length
  - Completed appointments
  - Average wait time
- Appointment management
  - View all appointments
  - Mark as completed
  - Cancel appointments
  - Filter by status
- Queue management
  - Serve next in queue
  - Mark as serving
  - Complete service
  - Cancel from queue
  - Automatic position recalculation

## Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Customization

### Adding New Services
Edit `src/context/AppointmentContext.js`:
```javascript
const [services, setServices] = useState([
  { id: 5, name: 'New Service', duration: 45, price: 80 },
  // ... existing services
]);
```

### Changing Business Hours
Modify `generateTimeSlots` function in `AppointmentContext.js`:
```javascript
const startHour = 9;  // 9 AM
const endHour = 17;   // 5 PM
```

### Adjusting Wait Time Calculation
Change in `joinQueue` function:
```javascript
const estimatedWaitTime = position * 15; // 15 minutes per person
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Limitations

- Data stored in localStorage (not persistent across devices)
- No backend API (client-side only)
- No real-time WebSocket updates
- No user authentication
- Single-location support

## Future Enhancements

- Backend API integration
- Database storage (PostgreSQL/MongoDB)
- User authentication and authorization
- Email/SMS notifications
- Multi-location support
- Payment integration
- Advanced analytics and reporting
- Mobile app
- Real-time notifications with WebSockets

## License

This project is for educational purposes.

## Support

For issues or questions, please refer to the Next.js documentation:
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

---

Built with ❤️ using Next.js and React

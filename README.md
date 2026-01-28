# Smart Appointment & Queue Management System

A modern, real-time appointment booking and queue management system built with Next.js 16, React 19, MongoDB, and TypeScript. This application helps businesses manage customer appointments, walk-in queues, and service scheduling efficiently.

## Features

### Customer Features
- **Online Appointment Booking** - Book appointments with real-time availability checking
- **Service Selection** - Browse and select from available services
- **Queue Status** - Real-time queue position tracking for walk-in customers
- **24-Hour Advance Booking** - Appointments must be booked at least 24 hours in advance

### Staff/Admin Features
- **Queue Management** - Manage customer queues and call next customers
- **Appointment Management** - View, approve, and manage appointments
- **Service Management** - Add, edit, and configure services
- **Real-time Updates** - Automatic updates for queue and appointment changes
- **Staff Authentication** - Secure login for staff members

### Technical Features
- **Server-Side Rendering** - Fast initial page loads with Next.js App Router
- **Real-time Data** - React Query for efficient data fetching and caching
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **Type Safety** - Full TypeScript support for better developer experience
- **Error Handling** - Centralized error handling with user-friendly toast notifications
- **MongoDB Integration** - Robust database with connection pooling and health checks

## Tech Stack

- **Frontend**: Next.js 16.1.4, React 19.2.3, Tailwind CSS 4
- **Backend**: Next.js API Routes, MongoDB 6.3.0
- **State Management**: React Query (TanStack Query)
- **Authentication**: Session-based with bcrypt password hashing
- **Validation**: Zod schema validation
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **TypeScript**: Full type coverage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB instance
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd smart-appointment
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartqueue?retryWrites=true&w=majority
MONGODB_DB_NAME=smartqueue

# Application
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-secure-jwt-secret-key
SESSION_SECRET=your-secure-session-secret-key
```

4. **Set up the database**
```bash
npm run setup-db
```

5. **Seed initial data (optional)**
```bash
npm run seed
```

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
smart-appointment/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard
│   │   ├── book/               # Appointment booking
│   │   ├── login/              # Staff login
│   │   ├── queue/              # Queue management
│   │   └── signup/             # Staff registration
│   ├── components/             # React components
│   │   ├── atoms/              # Basic UI components
│   │   ├── molecules/          # Composite components
│   │   └── organisms/          # Complex feature components
│   ├── context/                # React Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and libraries
│   │   ├── api/                # API client
│   │   ├── db/                 # Database connection
│   │   ├── models/             # Data models
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utility functions
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── scripts/                    # Database and setup scripts
└── tests/                      # Test files
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup-db` - Initialize database collections and indexes
- `npm run seed` - Seed database with sample data
- `npm test` - Run unit and integration tests
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:coverage` - Generate test coverage report

## API Endpoints

### Public Endpoints
- `GET /api/services` - Get all available services
- `POST /api/appointments` - Create new appointment
- `GET /api/queue/status` - Get current queue status

### Protected Endpoints (Staff Only)
- `GET /api/appointments` - List all appointments
- `PATCH /api/appointments/:id` - Update appointment status
- `POST /api/queue/next` - Call next customer in queue
- `POST /api/queue/entry` - Add walk-in to queue
- `GET /api/services` - Manage services (POST, PUT, DELETE)

## Database Schema

### Collections
- **users** - Staff and customer accounts
- **services** - Available services
- **appointments** - Booked appointments
- **queue_entries** - Walk-in queue entries
- **time_slot_locks** - Time slot availability tracking
- **audit_logs** - System audit trail

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `MONGODB_DB_NAME` | Database name | Yes |
| `NEXT_PUBLIC_API_URL` | API base URL | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `SESSION_SECRET` | Secret key for sessions | Yes |

## Key Features Implementation

### Error Handling
The application uses a centralized error handling system:
- Backend errors return structured responses with status codes and messages
- Frontend extracts and displays user-friendly error messages
- Toast notifications for success and error feedback
- Automatic deduplication prevents duplicate error messages

### MongoDB Connection
- Connection pooling for optimal performance
- Health checks before reusing cached connections
- IPv4-only mode to prevent SSL/TLS issues
- Automatic reconnection on connection failure
- Development and production optimizations

### React Query Configuration
- 5-minute stale time for data freshness
- No automatic retries to prevent error spam
- Optimistic updates for better UX
- Background refetching for real-time data

## Troubleshooting

### MongoDB Connection Issues
If you encounter SSL/TLS errors:
1. Ensure your MongoDB Atlas cluster allows connections from your IP
2. Use the connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
3. The application forces IPv4 to avoid IPv6 SSL handshake issues

### Build Errors
- Run `npm run lint` to check for code issues
- Ensure all TypeScript types are correctly defined
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

### Development Server Issues
- Clear browser cache and cookies
- Check that port 3000 is not in use
- Verify environment variables are correctly set in `.env.local`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.

---

Built with ❤️ using Next.js and React

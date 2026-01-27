# Smart Appointment API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Health Check

### GET /health
Check API and database connectivity.

**Response 200:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-27T10:00:00.000Z"
}
```

---

## Appointments

### POST /appointments
Create a new appointment.

**Request Body:**
```json
{
  "serviceId": "507f1f77bcf86cd799439011",
  "date": "2026-02-15",
  "timeSlot": {
    "startTime": "10:00",
    "endTime": "10:30"
  },
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "notes": "Optional notes"
  }
}
```

**Response 201:**
```json
{
  "appointment": {
    "id": "507f1f77bcf86cd799439012",
    "serviceId": "507f1f77bcf86cd799439011",
    "serviceName": "Haircut",
    "date": "2026-02-15",
    "timeSlot": { "startTime": "10:00", "endTime": "10:30" },
    "duration": 30,
    "status": "SCHEDULED",
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "createdAt": "2026-01-27T10:00:00.000Z",
    "updatedAt": "2026-01-27T10:00:00.000Z"
  },
  "message": "Appointment created successfully"
}
```

**Error 422 - Business Rule Violation:**
```json
{
  "statusCode": 422,
  "error": "Business Rule Violation",
  "errorCode": "TIME_SLOT_UNAVAILABLE",
  "message": "This time slot is already booked",
  "timestamp": "2026-01-27T10:00:00.000Z"
}
```

### GET /appointments
List appointments with optional filters.

**Query Parameters:**
- `serviceId` (optional) - Filter by service ID
- `date` (optional) - Filter by date (YYYY-MM-DD)
- `status` (optional) - Filter by status
- `customerEmail` (optional) - Filter by customer email

**Example:**
```
GET /appointments?date=2026-02-15&status=SCHEDULED
```

**Response 200:**
```json
{
  "appointments": [
    {
      "id": "507f1f77bcf86cd799439012",
      "serviceId": "507f1f77bcf86cd799439011",
      "serviceName": "Haircut",
      "date": "2026-02-15",
      "timeSlot": { "startTime": "10:00", "endTime": "10:30" },
      "duration": 30,
      "status": "SCHEDULED",
      "customerInfo": { ... },
      "createdAt": "2026-01-27T10:00:00.000Z",
      "updatedAt": "2026-01-27T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

### GET /appointments/:id
Get appointment details.

**Response 200:**
```json
{
  "appointment": { ... }
}
```

### PATCH /appointments/:id
Update appointment status or notes.

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "notes": "Updated notes"
}
```

**Valid Status Transitions:**
- SCHEDULED → CONFIRMED, CANCELLED
- CONFIRMED → IN_PROGRESS, NO_SHOW, CANCELLED
- IN_PROGRESS → COMPLETED
- COMPLETED → (none)
- CANCELLED → (none)
- NO_SHOW → (none)

**Response 200:**
```json
{
  "appointment": { ... },
  "message": "Appointment updated successfully"
}
```

**Error 409 - Domain Invariant Violation:**
```json
{
  "statusCode": 409,
  "error": "Domain Invariant Violation",
  "message": "Invalid status transition: SCHEDULED → COMPLETED",
  "metadata": { "invariant": "AppointmentStatusTransition" },
  "timestamp": "2026-01-27T10:00:00.000Z"
}
```

### DELETE /appointments/:id
Cancel an appointment.

**Response 200:**
```json
{
  "appointment": { ... },
  "message": "Appointment cancelled successfully"
}
```

---

## Services

### GET /services
List all active services.

**Response 200:**
```json
{
  "services": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Haircut",
      "description": "Professional haircut service",
      "duration": 30,
      "price": 25,
      "category": "Hair",
      "maxDailyAppointments": 20,
      "maxQueueSize": 10,
      "isActive": true,
      "businessHours": [
        { "dayOfWeek": 1, "isOpen": true, "openTime": "09:00", "closeTime": "17:00" }
      ]
    }
  ],
  "total": 4
}
```

### GET /services/:id
Get service details.

**Response 200:**
```json
{
  "service": { ... }
}
```

### GET /services/:id/slots?date=YYYY-MM-DD
Get available time slots for a service on a specific date.

**Query Parameters:**
- `date` (required) - Date in YYYY-MM-DD format

**Example:**
```
GET /services/507f1f77bcf86cd799439011/slots?date=2026-02-15
```

**Response 200:**
```json
{
  "slots": [
    { "startTime": "09:00", "endTime": "09:30", "available": true },
    { "startTime": "09:30", "endTime": "10:00", "available": false },
    { "startTime": "10:00", "endTime": "10:30", "available": true }
  ],
  "date": "2026-02-15"
}
```

---

## Error Codes

### Validation Errors (400)
- `INVALID_EMAIL` - Invalid email format
- `INVALID_PHONE` - Invalid phone number format
- `INVALID_DATE` - Invalid date format or value
- `INVALID_TIME_SLOT` - Invalid time slot

### Business Rule Violations (422)
- `TIME_SLOT_UNAVAILABLE` - Time slot already booked
- `DAILY_CAPACITY_EXCEEDED` - Maximum daily appointments reached
- `DUPLICATE_APPOINTMENT` - Customer already has appointment on this day
- `BOOKING_TOO_SOON` - Must book at least 24 hours in advance
- `BOOKING_TOO_FAR` - Cannot book more than 90 days in advance
- `BUSINESS_HOURS_CLOSED` - Closed on selected day
- `BUSINESS_HOURS_WEEKDAY` - Outside weekday hours (9 AM - 5 PM)
- `BUSINESS_HOURS_SATURDAY` - Outside Saturday hours (10 AM - 2 PM)

### Resource Errors (404)
- `SERVICE_NOT_FOUND` - Service does not exist
- `APPOINTMENT_NOT_FOUND` - Appointment does not exist

### Domain Invariant Violations (409)
- `INVALID_STATUS_TRANSITION` - Invalid appointment status change

---

## Queue

### POST /api/queue
Join a service queue.

**Request Body:**
```json
{
  "serviceId": "507f1f77bcf86cd799439011",
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "notes": "Optional notes"
  },
  "priority": "NORMAL"
}
```

**Response 201:**
```json
{
  "queueEntry": {
    "id": "507f1f77bcf86cd799439013",
    "serviceId": "507f1f77bcf86cd799439011",
    "serviceName": "Haircut",
    "position": 3,
    "status": "WAITING",
    "priority": "NORMAL",
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "estimatedWaitTime": 45,
    "joinedAt": "2026-01-27T10:00:00.000Z"
  },
  "message": "Successfully joined the queue"
}
```

**Error 422 - Queue Full:**
```json
{
  "statusCode": 422,
  "error": "Business Rule Violation",
  "errorCode": "QUEUE_FULL",
  "message": "Queue is full (maximum 10 people)",
  "metadata": {
    "currentSize": 10,
    "maxSize": 10
  },
  "timestamp": "2026-01-27T10:00:00.000Z"
}
```

### GET /api/queue
List queue entries with optional filters.

**Query Parameters:**
- `serviceId` (optional) - Filter by service ID
- `status` (optional) - Filter by status

**Example:**
```
GET /api/queue?serviceId=507f1f77bcf86cd799439011&status=WAITING
```

**Response 200:**
```json
{
  "queue": [
    {
      "id": "507f1f77bcf86cd799439013",
      "serviceId": "507f1f77bcf86cd799439011",
      "serviceName": "Haircut",
      "position": 1,
      "status": "WAITING",
      "priority": "HIGH",
      "customerInfo": { ... },
      "estimatedWaitTime": 15,
      "joinedAt": "2026-01-27T09:30:00.000Z"
    }
  ],
  "total": 1
}
```

### GET /api/queue/:id
Get queue entry details.

**Response 200:**
```json
{
  "queueEntry": { ... }
}
```

### PATCH /api/queue/:id
Update queue entry status or position.

**Request Body:**
```json
{
  "status": "CALLED",
  "position": 2
}
```

**Valid Status Transitions:**
- WAITING → CALLED, CANCELLED
- CALLED → IN_SERVICE, CANCELLED
- IN_SERVICE → COMPLETED
- COMPLETED → (none)
- CANCELLED → (none)

**Response 200:**
```json
{
  "queueEntry": { ... },
  "message": "Queue entry updated successfully"
}
```

### DELETE /api/queue/:id
Leave the queue.

**Response 200:**
```json
{
  "queueEntry": { ... },
  "message": "Successfully left the queue"
}
```

### POST /api/queue/next
Call the next person in queue (priority-based).

**Request Body:**
```json
{
  "serviceId": "507f1f77bcf86cd799439011"
}
```

**Response 200:**
```json
{
  "queueEntry": {
    "id": "507f1f77bcf86cd799439013",
    "status": "CALLED",
    "calledAt": "2026-01-27T10:00:00.000Z",
    ...
  },
  "message": "Called: John Doe"
}
```

**Response 200 (Empty Queue):**
```json
{
  "queueEntry": null,
  "message": "Queue is empty"
}
```

---

## Updated Error Codes

### Queue Business Rule Violations (422)
- `QUEUE_FULL` - Queue has reached maximum capacity
- `ALREADY_IN_QUEUE` - Customer already in queue for this service
- `QUEUE_CLOSED` - Queue is not operating at this time


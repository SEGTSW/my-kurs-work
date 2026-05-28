# Microservices Architecture

The backend is split into independent services. Each service has its own
`package.json`, `tsconfig.json`, `src` folder, Express app, routes, middleware,
and Prisma client.

## Services

```text
frontend
  -> api-gateway :3001
      -> auth-service    :4001
      -> room-service    :4002
      -> booking-service :4003
```

## Responsibilities

### `services/api-gateway`

Keeps the public API stable for the frontend and proxies requests to internal
services.

- `/api/auth/*` -> `auth-service`
- `/api/users` -> `auth-service`
- `/api/users/:id/bookings` -> `booking-service`
- `/api/rooms/*` -> `room-service`
- `/api/analytics` -> `room-service`
- `/api/bookings/*` -> `booking-service`

### `services/auth-service`

Owns authentication and user administration.

- registration
- login
- JWT creation
- user list
- promote user to admin

### `services/room-service`

Owns rooms and room-related analytics.

- room list
- available rooms
- create room
- booking analytics by room

### `services/booking-service`

Owns booking workflows.

- create booking
- list my bookings
- list all bookings for admin
- delete booking
- list bookings by user

## Running

Run all services:

```bash
npm run dev
```

Run a single service:

```bash
npm run start:gateway
npm run start:auth
npm run start:rooms
npm run start:bookings
```

The frontend still calls `/api`, so no frontend API changes are required.

## Data

All services currently use the same PostgreSQL database through Prisma:

```text
postgresql://maksimdenderis@localhost:5432/booking_system
```

For a larger production system, the next step would be splitting the database
ownership per service and replacing direct cross-table reads with service APIs
or events.

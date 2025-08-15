# Ticket API

A comprehensive Node.js API for managing event tickets, support tickets, and user interactions with real-time communication capabilities.

## Overview

This project is a RESTful API built with Express.js and MongoDB that provides functionality for event management, ticket support system, user authentication, and payment processing. It includes real-time communication features using Socket.IO for instant messaging in support tickets.

## Features

### User Management

- User registration and authentication
- Role-based access control (USER, OWNER, ADMIN, SUPPORT)
- OTP verification system

### Event Management

- Create and manage events
- Event registration and attendance tracking
- Event capacity management
- Event search and filtering

### Support Ticket System

- Create support tickets
- Real-time messaging between users and support staff
- Ticket status management (open, pending, closed)
- Notification system for new messages

### Payment Processing

- Transaction management for event registrations
- Multiple payment methods (online, wallet)
- Transaction status tracking (pending, completed, failed, refunded)

### Notification System

- User notifications for various events
- Different notification types (admin, event, system, ticket)
- Read/unread status tracking

## Technology Stack

### Backend

- Node.js - JavaScript runtime
- Express.js - Web framework
- TypeScript - Type-safe JavaScript
- MongoDB - NoSQL database
- Mongoose - MongoDB object modeling
- Socket.IO - Real-time communication
- JWT - Authentication and authorization
- Joi - Data validation

### Development Tools

- ts-node-dev - TypeScript execution and development
- nodemailer - Email sending functionality
- multer - File upload handling
- dotenv - Environment variable management

## Project Structure

├── src/
│   ├── app.ts                 # Application entry point
│   ├── config/                # Configuration files
│   │   ├── constants.ts       # Application constants
│   │   └── db.ts              # Database connection
│   ├── core/                  # Core functionality
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # Main router
│   │   ├── types/             # TypeScript interfaces
│   │   ├── uploads/           # File upload directory
│   │   └── utils/             # Utility functions
│   └── modules/               # Feature modules
│       ├── admin/             # Admin functionality
│       ├── events/            # Event management
│       ├── notification/      # Notification system
│       ├── support/           # Support staff management
│       ├── tickets/           # Ticket system
│       ├── transaction/       # Payment processing
│       └── user/              # User management

## API Endpoints

### User Authentication

- POST /api/v1/user/get-otp
- POST /api/v1/user/check-otp

### Public Routes

- GET /api/v1/p/events - Get public events

### Event Management

- POST /api/v1/owner/events - Create a new event
- GET /api/v1/owner/events - Get owner's events

### Ticket System

- POST /api/v1/ticket - Create a new support ticket
- GET /api/v1/ticket/my - Get user's tickets
- POST /api/v1/ticket/messages/:ticketId - Send a message in a ticket
- PATCH /api/v1/ticket/status/:ticketId - Update ticket status

### Transactions

- POST /api/v1/t - Create a new transaction

### Admin Routes

- Various admin endpoints for managing users, events, and support staff

## Real-time Communication

The application uses Socket.IO for real-time messaging in the ticket support system:

- Namespace: /tickets
- Events:
  - registerUser - Register a user in the socket system
  - joinTicket - Join a specific ticket room
  - sendMessage - Send a message in a ticket
  - newMessage - Receive a new message
  - newTicketMessage - Notification for a new message

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository

```bash
git clone https://github.com/sohseyedi-web/dexswap-lion
```

2. Install dependencies

```bash
npm install
```

3. Create a .env file based on .env.example
4. Start the development server

```bash
npm run dev
```

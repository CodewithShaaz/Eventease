# 🎉 EventEase

**A modern, full-stack event management platform built with Next.js 15, TypeScript, and PostgreSQL**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🚀 Live Demo](#-live-demo)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏃‍♂️ Quick Start](#️-quick-start)
- [⚙️ Environment Setup](#️-environment-setup)
- [🗃️ Database Setup](#️-database-setup)
- [👤 User Roles & Permissions](#-user-roles--permissions)
- [🔐 Sample Credentials](#-sample-credentials)
- [📱 API Endpoints](#-api-endpoints)
- [🎨 UI Components](#-ui-components)
- [📝 Scripts](#-scripts)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 Features

### 🎯 **Core Functionality**
- **Event Creation & Management** - Create, edit, and delete events with rich details
- **RSVP System** - Users can RSVP to events with real-time attendance tracking
- **User Authentication** - Secure sign-up, sign-in, and session management
- **Role-Based Access Control** - Four-tier permission system (Admin, Staff, Event Owner, Attendee)

### 🎛️ **Admin Dashboard**
- **User Management** - View, manage, and change user roles
- **Event Oversight** - Monitor all events across the platform
- **Analytics Dashboard** - Real-time statistics and insights
- **Export Functionality** - Export attendee lists to CSV

### 🔐 **Security & Authentication**
- **NextAuth.js Integration** - Secure authentication with session management
- **Password Hashing** - bcrypt.js for secure password storage
- **Role-Based Routing** - Protected routes based on user permissions
- **Input Validation** - Comprehensive form validation and sanitization

### 🎨 **Modern UI/UX**
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Component Library** - Custom UI components built with Radix UI
- **Interactive Elements** - Smooth animations and transitions
- **Accessibility** - WCAG compliant design patterns

### 🚀 **Performance & Scalability**
- **Server-Side Rendering** - Next.js 15 with App Router
- **Database Optimization** - Efficient Prisma queries with PostgreSQL
- **Type Safety** - Full TypeScript integration
- **Error Handling** - Comprehensive error management and logging

## 🚀 Live Demo

**🎉 EventEase is now live and ready to use!**

```
🌐 Live URL: https://eventease01.vercel.app
```

**Try it out with these sample credentials:**
- **Admin**: admin@eventease.com / admin123
- **Event Owner**: owner@eventease.com / owner123
- **Attendee**: user@eventease.com / user123

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15.5.0 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.0
- **Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Date Handling**: date-fns

### **Backend**
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Password Hashing**: bcryptjs

### **Database**
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Hosting**: Render (or your preferred provider)

### **Development**
- **Package Manager**: npm
- **Linting**: ESLint
- **Code Formatting**: Prettier (configured via ESLint)
- **Type Checking**: TypeScript

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/eventease.git
cd eventease
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
nano .env
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application running!

## ⚙️ Environment Setup

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/eventease"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

> **Important**: Never commit your `.env` file to version control. Use `.env.example` for reference.

## 🗃️ Database Setup

### Using Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb eventease

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://yourusername@localhost:5432/eventease"
```

### Using Cloud Database (Render/Railway/Supabase)
1. Create a PostgreSQL instance on your preferred platform
2. Copy the connection string to your `.env` file
3. Run migrations: `npx prisma migrate dev`

### Database Schema
```sql
-- Users table with role-based access
User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  password  String
  role      UserRole @default(ATTENDEE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

-- Events table
Event {
  id          String   @id @default(cuid())
  title       String
  description String?
  location    String?
  date        DateTime
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

-- RSVP system
RSVP {
  id      String @id @default(cuid())
  eventId String
  userId  String
  @@unique([eventId, userId])
}
```

## 👤 User Roles & Permissions

EventEase implements a four-tier role-based access control system:

### 🔴 **Admin (ADMIN)**
- **Full application control** including user management and system configurations
- Access to admin dashboard with user management
- Can create, edit, and delete any event
- Can change user roles
- Can export data and view analytics

### 🔵 **Staff (STAFF)**
- **Moderate events** and attendee interactions
- Can manage all events (create, edit, delete)
- Access to event analytics
- Cannot manage users or change roles

### 🟣 **Event Owner (EVENT_OWNER)**
- **Create, manage, and monitor** their own events
- Can view attendee lists for their events
- Can export attendee data for their events
- Cannot access other users' events

### 🟢 **Attendee (ATTENDEE)**
- **Monitor events** and home page display only
- Can RSVP to events
- Can view event details
- **Cannot create events** (restricted access)

## 🔐 Sample Credentials

For testing and evaluation purposes, use these pre-configured accounts:

### 👑 **Administrator Account**
```
📧 Email: admin@eventease.com
🔑 Password: admin123
🎯 Role: ADMIN
✨ Access: Full system control, user management, analytics
```

### � **Staff Account**
```
📧 Email: john@test.com
🔑 Password: aA12345
🎯 Role: STAFF
✨ Access: Moderate events and attendee interactions, manage all events
```

### �👥 **Attendee Accounts**
```
📧 Email: attendee1@test.com
🔑 Password: password123
🎯 Role: ATTENDEE
✨ Access: View events, RSVP only

📧 Email: attendee2@test.com
🔑 Password: password123
🎯 Role: ATTENDEE
✨ Access: View events, RSVP only
```

### 🎭 **Event Owner Account**
```
📧 Email: owner@test.com
🔑 Password: owner123
🎯 Role: EVENT_OWNER
✨ Access: Create and manage own events
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign-in
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - User sign-out

### User Management
- `POST /api/register` - User registration
- `GET /api/admin/users` - Get all users (Admin only)
- `POST /api/admin/users/role` - Update user role (Admin only)

### Event Management
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `DELETE /api/admin/events/[id]` - Delete event
- `GET /api/events/[id]/attendees/export` - Export attendees

### Analytics
- `GET /api/admin/stats` - Get dashboard statistics

## 🎨 UI Components

EventEase uses a custom component library built on top of Radix UI:

### Core Components
- **Button** - Multiple variants (primary, secondary, outline, ghost)
- **Input & Textarea** - Form elements with validation states
- **Card** - Content containers with headers and footers
- **Badge** - Status indicators and labels
- **Alert** - Success, warning, and error messages

### Navigation
- **Navbar** - Responsive navigation with role-based menu items
- **Dropdown Menu** - User account management
- **Tabs** - Admin dashboard section navigation

### Data Display
- **Table** - Sortable data tables for users and events
- **Dialog** - Modal overlays for forms and confirmations

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run seed         # Seed database with sample data
npx prisma studio    # Open Prisma database browser
npx prisma migrate dev # Run database migrations

# Deployment
npm run build        # Build for production
npm run start        # Start production server
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add amazing feature"`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint configuration provided
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly

### Reporting Issues
- Use GitHub Issues to report bugs
- Include steps to reproduce
- Provide environment details
- Add screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Prisma Team** - For the excellent database toolkit
- **Tailwind CSS** - For the utility-first CSS framework
- **Radix UI** - For accessible component primitives
- **Vercel** - For hosting and deployment platform

---

<div align="center">

**Built with ❤️ by [Md Shaaz Ahmed]**

[🌐 Live Demo](https://your-app.vercel.app) • [📧 Contact](mailto:your.email@example.com) • [🐛 Report Bug](https://github.com/yourusername/eventease/issues)

</div>

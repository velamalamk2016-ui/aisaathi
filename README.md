# AI Saathi - Educational Platform

AI Saathi is a comprehensive educational platform designed specifically for Indian classrooms. It provides AI-powered tools for teachers and students with multilingual support, focusing on Hindi, English, Tamil, Telugu, and Bengali languages.

## 🚀 Key Features

### 🤖 AI-Powered Agents
- **Teaching Aids Agent** - Generates worksheets, flashcards, and stories
- **Lesson Plan Agent** - Creates cross-grade activities with time-based adjustments
- **Assessment Agent** - Conducts oral quizzes with immediate feedback
- **Multilingual Agent** - Provides content translation across supported languages
- **Admin Agent** - Manages attendance, progress tracking, and reports
- **Storyteller Agent** - Creates educational stories with moral lessons

### 📊 Real-time Dashboard
- Live attendance tracking with database persistence
- Student progress analytics
- Resource usage statistics
- Activity monitoring across all AI agents

### 👥 Student Profile Management
- Comprehensive student profiles with academic tracking
- Attendance percentage calculation
- Multi-grade classroom support
- Accessibility features for special needs students

### 🌐 Multilingual Support
- 12 Indian languages supported
- Real-time translation capabilities
- Regional content adaptation
- Cultural context awareness

## 🛠️ Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with shadcn/ui components
- **TanStack Query** for server state management
- **Wouter** for lightweight routing
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Drizzle ORM
- **Neon Database** (Serverless PostgreSQL)
- **Google Gemini API** integration via Node.js service
- **Session-based authentication**

### Database Schema
```sql
-- Core tables with relationships
- users (teacher accounts)
- students (student profiles)
- student_profiles (detailed student information)
- attendance_records (daily attendance tracking)
- lessons (educational content)
- assessments (evaluation records)
- activities (AI agent usage tracking)
- resources (teaching materials)
- accessibility_students (special needs support)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/velamalamk2016-ui/aisaathi.git
cd aisaathi
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file with:
```env
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

4. **Database Setup**
```bash
npm run db:push
```

5. **Start Development**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
aisaathi/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   │   ├── agents/     # AI agent interfaces
│   │   │   ├── dashboard.tsx
│   │   │   └── student-profiles.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Node.js backend
│   ├── services/           # Python AI services
│   │   ├── teaching_aids_agent.py
│   │   ├── lesson_plan_agent.py
│   │   └── gemini-bridge.ts
│   ├── index.ts           # Express server
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── db.ts             # Database connection
├── shared/                # Shared TypeScript types
│   ├── schema.ts         # Database schema & types
│   └── student-profile-schema.ts
└── package.json
```

## 🔄 Core Workflows

### Attendance Management
1. **Daily Submission**: Teachers mark Present/Absent for each student
2. **Database Persistence**: Attendance records saved with date stamps
3. **Historical Tracking**: View attendance for any previous date
4. **Real-time Dashboard**: Live updates showing current attendance counts

### AI Content Generation
1. **Request Processing**: Frontend sends structured requests to AI agents
2. **Python Service**: Gemini API processes educational content generation
3. **Response Handling**: Generated content returned and displayed
4. **Activity Logging**: All AI interactions tracked for analytics

### Student Profile System
1. **Profile Creation**: Comprehensive student information capture
2. **Academic Tracking**: Performance metrics and attendance percentages
3. **Special Needs Support**: Accessibility features and accommodations
4. **Multi-grade Management**: Support for mixed-age classrooms

## 🎯 Recent Achievements

✅ **Persistent Attendance System**
- Database-backed attendance with cross-restart persistence
- Date-based historical attendance retrieval
- Real-time dashboard updates with actual data
- Seamless frontend-backend integration

✅ **Google Gemini Integration**
- Python FastAPI service for AI content generation
- Multi-agent system with specialized educational tools
- Gemini 1.5 Pro model for enhanced content quality
- Structured response formatting for consistent output

✅ **Comprehensive Student Management**
- Full CRUD operations for student profiles
- Advanced filtering and search capabilities
- Attendance percentage calculations
- Special needs accommodation tracking

## 🌟 Development Features

### Offline-First Design
- Local storage caching for offline access
- Sync capabilities when connection restored
- Progressive web app characteristics

### Accessibility Features
- Screen reader support
- Keyboard navigation
- High contrast mode support
- Text size adjustment
- Special needs student accommodations

### Performance Optimizations
- React Query caching strategies
- Optimistic updates for better UX
- Lazy loading for large data sets
- Efficient database queries with proper indexing

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API authentication
- `NODE_ENV`: Environment mode (production/development)

### Database Migration
```bash
npm run db:push
```

## 📊 API Documentation

### Attendance Endpoints
```
GET  /api/admin/attendance?date=YYYY-MM-DD
POST /api/admin/attendance/submit
GET  /api/dashboard/stats
```

### Student Management
```
GET    /api/student-profiles
POST   /api/student-profiles
PUT    /api/student-profiles/:id
DELETE /api/student-profiles/:id
```

### AI Agent Endpoints
```
POST /api/teaching-aids/generate
POST /api/lesson-plan/generate
POST /api/multilingual/translate
POST /api/assessment/generate
POST /api/storyteller/generate
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Neon Database for serverless PostgreSQL hosting
- Replit for development environment support
- Open source community for various tools and libraries

---

**AI Saathi** - Empowering education through intelligent technology 🎓
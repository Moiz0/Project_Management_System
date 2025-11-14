# Project Management System

A comprehensive **role-based project management system** with task tracking, resolution workflows, and analytics dashboards.

---

## 🚀 Features

### Role-Based Access Control
- **Admin**: Full system control with user management and system-wide analytics.
- **Moderator**: Project and task management with team oversight.
- **User**: Task execution with status updates and resolution submissions.

### Core Functionality

#### User Management (Admin only)
- Create, edit, delete users
- Change user roles dynamically
- View all system users

#### Project Management
- Create and manage projects
- Assign moderators and team members
- Track project status (active/completed)
- Project-specific analytics

#### Task Management (CRUD)
- Create, read, update, delete tasks
- Assign tasks to team members
- Track task status: `OPEN → IN-PROGRESS → RESOLVED → VERIFIED`
- Resolution workflow with verification

#### Ticket Resolution System
- Users submit task resolutions with notes
- Moderators review and approve/reject resolutions
- Quality control through verification process

#### Analytics Dashboard
- System-wide statistics
- Project status overview
- Task distribution metrics
- User performance tracking
- Moderator productivity analysis

---

## 🛠️ Technology Stack

**Backend**
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- Bcrypt for password hashing
- MVC Architecture

**Frontend**
- Next.js 14 (App Router)
- TypeScript for type safety
- Tailwind CSS for styling
- Context API for state management
- React Hooks for component logic

---

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB v6+
- npm or yarn

### Backend Setup
```bash 
cd backend
npm install

```
- Create .env file
MONGODB_URI=mongodb://127.0.0.1:27017/project-management
JWT_SECRET=your-super-secret-jwt-key
PORT=5000

### Frontend Setup
cd frontend
npm install

Create .env.local file:
```bash 
NEXT_PUBLIC_API_URL=http://localhost:5000/api

```
Start the development server:
```
npm run dev

Frontend runs on: http://localhost:3000

```
## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user  
- `POST /api/auth/login` - Login user  
- `GET /api/auth/me` - Get current user  

### Users (Admin Only)
- `GET /api/users` - Get all users  
- `POST /api/users` - Create user  
- `PUT /api/users/:id` - Update user  
- `DELETE /api/users/:id` - Delete user  

### Projects
- `GET /api/projects` - Get all projects  
- `GET /api/projects/:id` - Get project by ID  
- `POST /api/projects` - Create project  
- `PUT /api/projects/:id` - Update project  
- `DELETE /api/projects/:id` - Delete project  

### Tasks
- `GET /api/tasks` - Get all tasks  
- `GET /api/tasks/:id` - Get task by ID  
- `POST /api/tasks` - Create task  
- `PUT /api/tasks/:id` - Update task  
- `PATCH /api/tasks/:id/verify` - Verify task resolution  
- `DELETE /api/tasks/:id` - Delete task  

### Analytics
- `GET /api/analytics/system` - System-wide analytics  
- `GET /api/analytics/project/:projectId` - Project analytics  
- `GET /api/analytics/users` - User performance  
- `GET /api/analytics/moderators` - Moderator performance  

---

## 👥 User Roles & Permissions

**Admin**
- ✅ Full system access  
- ✅ User management (CRUD)  
- ✅ View all projects and tasks  
- ✅ System-wide analytics  
- ✅ Create/edit/delete projects  
- ✅ Create/edit/delete/verify tasks  

**Moderator**
- ✅ Create and manage projects  
- ✅ Create and assign tasks  
- ✅ Verify task resolutions  
- ✅ View project-specific analytics  
- ✅ Manage team members  
- ❌ Cannot manage users  

**User**
- ✅ View assigned tasks  
- ✅ Update task status  
- ✅ Submit task resolutions  
- ✅ Add resolution notes  
- ❌ Cannot create/edit projects  
- ❌ Cannot create/assign tasks  

---

## 🔄 Task Workflow

1. Moderator creates task → Status: `OPEN`  
2. User starts task → Status: `IN-PROGRESS`  
3. User completes task → Status: `RESOLVED` (with notes)  
4. Moderator reviews:  
   - Approve → Status: `VERIFIED`  
   - Reject → Status: `IN-PROGRESS` (back to user)  

---

## 🎨 Default Users (For Testing)

**Admin Account**  
- Email: `admin@example.com`  
- Password: `admin123`  
- Role: `admin`  

**Moderator Account**  
- Email: `moderator@example.com`  
- Password: `mod123`  
- Role: `moderator`  

**User Account**  
- Email: `user@example.com`  
- Password: `user123`  
- Role: `user`  

---

## 🔒 Security Features
- JWT-based authentication  
- Password hashing with bcrypt  
- Role-based access control (RBAC)  
- Protected API routes  
- Client-side route protection  
- Token expiration handling  

---

## 📊 Analytics Features

**System Analytics (Admin)**
- Total projects count  
- Active vs completed projects  
- Total tasks across system  
- Task distribution by status  
- User performance metrics  
- Moderator productivity analysis  

**Project Analytics (Moderator)**
- Project-specific task count  
- Task status breakdown  
- Team member performance  
- Completion rates  
- Project progress tracking 


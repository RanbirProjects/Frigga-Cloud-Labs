📝 DocCollab - Advanced Document Collaboration Platform

A full-stack document collaboration platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring real-time collaboration, advanced document management, and comprehensive user features.
Website page
![D4F0EE72-6427-452A-B93E-9FA77F8BF747](https://github.com/user-attachments/assets/beee7f35-e352-405e-aa8a-4026dd1a2a72)


🚀 Features

🔐 Authentication & User Management
- User Registration & Login: Secure authentication with JWT tokens
- User Profiles: Comprehensive user profiles with statistics and activity tracking
- Profile Management: Edit profile information, bio, and preferences
- Account Settings: Password changes, email preferences, and account configuration
- 
 📄 Document Management
- Document Creation: Create documents with rich text editing
- Document Templates: Pre-built templates for common document types:
  - Blank Document
  - Meeting Notes
  - Project Plan
  - Research Paper
- Document Organization: Tags, categories, and advanced filtering
- Bulk Operations: Select multiple documents for bulk actions (delete, export, archive)
- Version Control: Track document versions and restore previous versions
- Auto-save: Automatic document saving with configurable intervals

 👥 Collaboration Features
- Real-time Collaboration: Multiple users can edit documents simultaneously
- **Permission Management**: Granular permissions (view, edit, admin)
- **Document Sharing**: Share documents with specific users or make them public
- **Collaborator Management**: Add/remove collaborators with different permission levels
- **Activity Tracking**: Track who made changes and when

### 🔍 Advanced Search & Filtering
- **Full-text Search**: Search across document titles, content, and tags
- **Advanced Filters**: Filter by date range, status, tags, and collaborators
- **Sorting Options**: Sort by title, creation date, modification date, or author
- **View Modes**: Grid and list view for document browsing

### 💬 Communication & Comments
- **Document Comments**: Add comments to documents for feedback and discussion
- **Real-time Notifications**: Notification system for document updates and collaboration invites
- **Activity Feed**: Track recent activity and document changes

### 📊 Analytics & Statistics
- **User Dashboard**: Comprehensive statistics and overview
- **Document Analytics**: Track document views, edits, and collaboration metrics
- **User Statistics**: Personal document counts, collaboration stats, and achievements
- **Activity History**: Detailed activity tracking and timeline

### 🎨 Enhanced UI/UX
- **Modern Design**: Clean, responsive design with Tailwind CSS
- **Dark/Light Mode**: Theme switching capabilities
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Loading States**: Smooth loading animations and progress indicators
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Accessibility**: WCAG compliant design with keyboard navigation

### 🔧 Technical Features
- **Real-time Updates**: WebSocket integration for live collaboration
- **Offline Support**: Basic offline functionality with sync when reconnected
- **File Export**: Export documents in multiple formats
- **Backup & Recovery**: Automatic backups and data recovery options
- **Performance Optimization**: Lazy loading, pagination, and efficient data fetching

## 🛠️ Technology Stack

### Frontend
- **React.js**: Modern UI framework with hooks and context
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Heroicons**: Beautiful SVG icons
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **React Hot Toast**: Toast notifications
- **Date-fns**: Date manipulation library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database (with in-memory fallback)
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware

### Development Tools
- **Concurrently**: Run multiple commands simultaneously
- **Nodemon**: Auto-restart server on file changes
- **ESLint**: Code linting and formatting

## 📁 Project Structure

```
figga-cloud-labs-project/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Document.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── documents.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.js
│   │   │   │   ├── LoadingSpinner.js
│   │   │   │   └── NotificationSystem.js
│   │   │   ├── Dashboard.js
│   │   │   ├── DocumentEditor.js
│   │   │   ├── Header.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── UserProfile.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── DocumentContext.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional - uses in-memory database by default)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd figga-cloud-labs-project
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   ```bash
   # Create environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Start the application**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the backend (port 5001) and frontend (port 3000) servers.

### Alternative: Run Servers Separately

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Documents
- `GET /api/documents` - Get all documents (with pagination)
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get specific document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/share` - Share document
- `POST /api/documents/:id/comments` - Add comment

## 🎯 Key Features in Detail

### 1. Document Templates
The platform includes pre-built templates for common document types:
- **Meeting Notes**: Structured template for meeting documentation
- **Project Plan**: Comprehensive project planning template
- **Research Paper**: Academic writing template
- **Blank Document**: Clean slate for custom content

### 2. Real-time Collaboration
- **Live Editing**: Multiple users can edit simultaneously
- **Typing Indicators**: Shows when collaborators are typing
- **Conflict Resolution**: Handles concurrent edits gracefully
- **Presence Awareness**: Shows who is currently viewing/editing

### 3. Advanced Search & Filtering
- **Full-text Search**: Search across all document content
- **Tag-based Filtering**: Filter documents by tags
- **Date Range Filtering**: Filter by creation or modification dates
- **Status Filtering**: Filter by document status (draft, published, archived)
- **Collaborator Filtering**: Filter by document collaborators

### 4. Notification System
- **Real-time Notifications**: Instant updates for document changes
- **Email Notifications**: Optional email alerts
- **Notification Preferences**: Customizable notification settings
- **Read/Unread Status**: Track notification status

### 5. User Analytics
- **Document Statistics**: Track document creation and collaboration
- **Activity Timeline**: View recent activity and changes
- **Achievement System**: Gamified achievements for user engagement
- **Performance Metrics**: Track user engagement and productivity

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Cross-origin request protection
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **Error Handling**: Secure error messages without data leakage

## 📱 Responsive Design

The platform is fully responsive and works seamlessly across:
- **Desktop**: Full-featured experience with all capabilities
- **Tablet**: Optimized layout for touch interaction
- **Mobile**: Streamlined interface for mobile devices

## 🚀 Performance Optimizations

- **Lazy Loading**: Components load on demand
- **Pagination**: Efficient data loading for large datasets
- **Caching**: Client-side caching for improved performance
- **Debounced Search**: Optimized search with debouncing
- **Image Optimization**: Compressed images and lazy loading

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5001
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_uri
NODE_ENV=development
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_WS_URL=ws://localhost:5001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎉 Acknowledgments

- Built with modern web technologies
- Inspired by popular document collaboration platforms
- Community-driven development approach

---

**DocCollab** - Empowering collaboration through advanced document management 🚀 # Frigga-Cloud-Labs

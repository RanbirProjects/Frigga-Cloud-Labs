const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// In-memory database (temporary solution)
const inMemoryDB = {
  users: [],
  documents: [],
  sessions: []
};

// Simple authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  // Simple token validation (in production, use proper JWT)
  const user = inMemoryDB.sessions.find(session => session.token === token);
  if (!user) {
    return res.status(403).json({ message: 'Invalid token' });
  }
  
  req.user = user;
  next();
};

// Routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const existingUser = inMemoryDB.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    password: password, // In production, hash this
    createdAt: new Date()
  };
  
  inMemoryDB.users.push(newUser);
  
  // Create sample documents for the new user
  const sampleDocuments = [
    {
      id: `doc_${Date.now()}_1`,
      title: 'Welcome to Document Collaboration',
      content: 'This is your first document. You can edit it, share it with others, and collaborate in real-time.',
      ownerId: newUser.id,
      isPublic: false,
      sharedWith: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      tags: ['welcome', 'getting-started']
    },
    {
      id: `doc_${Date.now()}_2`,
      title: 'Project Ideas',
      content: 'Here are some ideas for future projects:\n\n1. Real-time collaboration features\n2. Version control system\n3. Advanced sharing options\n4. Mobile app development',
      ownerId: newUser.id,
      isPublic: false,
      sharedWith: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      tags: ['ideas', 'projects']
    }
  ];
  
  inMemoryDB.documents.push(...sampleDocuments);
  
  const token = `token_${Date.now()}`;
  inMemoryDB.sessions.push({ token, userId: newUser.id });
  
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: newUser.id, username: newUser.username, email: newUser.email }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = inMemoryDB.users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = `token_${Date.now()}`;
  inMemoryDB.sessions.push({ token, userId: user.id });
  
  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, username: user.username, email: user.email }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = inMemoryDB.users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.username,
      email: user.email
    }
  });
});

app.get('/api/documents', authenticateToken, (req, res) => {
  const userDocuments = inMemoryDB.documents.filter(doc => 
    doc.ownerId === req.user.userId || doc.sharedWith.includes(req.user.userId)
  );
  
  // Return proper format with data and pagination
  res.json({
    success: true,
    count: userDocuments.length,
    total: userDocuments.length,
    pagination: {
      current: 1,
      pages: 1,
      hasNext: false,
      hasPrev: false
    },
    data: userDocuments
  });
});

app.post('/api/documents', authenticateToken, (req, res) => {
  const { title, content, isPublic } = req.body;
  
  const newDocument = {
    id: Date.now().toString(),
    title: title || 'Untitled Document',
    content: content || '',
    ownerId: req.user.userId,
    isPublic: isPublic || false,
    sharedWith: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1
  };
  
  inMemoryDB.documents.push(newDocument);
  res.status(201).json(newDocument);
});

app.put('/api/documents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  
  const document = inMemoryDB.documents.find(doc => doc.id === id);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  if (document.ownerId !== req.user.userId) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  document.title = title || document.title;
  document.content = content || document.content;
  document.updatedAt = new Date();
  document.version += 1;
  
  res.json(document);
});

app.get('/api/documents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const document = inMemoryDB.documents.find(doc => doc.id === id);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  if (document.ownerId !== req.user.userId && !document.sharedWith.includes(req.user.userId)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  res.json(document);
});

// Socket.IO for real-time collaboration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-document', (documentId) => {
    socket.join(documentId);
    console.log(`User ${socket.id} joined document ${documentId}`);
  });
  
  socket.on('leave-document', (documentId) => {
    socket.leave(documentId);
    console.log(`User ${socket.id} left document ${documentId}`);
  });
  
  socket.on('document-change', (data) => {
    socket.to(data.documentId).emit('document-updated', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Document Collaboration Platform`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`⚠️  Using in-memory database (data will be lost on restart)`);
}); 
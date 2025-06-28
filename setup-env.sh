#!/bin/bash

echo "Setting up environment for Document Collaboration Platform"
echo "=========================================================="

# Create .env file in backend
echo "Creating .env file in backend directory..."
cat > backend/.env << EOF
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration (using MongoDB Atlas free tier)
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://testuser:testpassword@cluster0.mongodb.net/document-collaboration?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
EOF

echo "✅ .env file created in backend directory"
echo ""
echo "⚠️  IMPORTANT: You need to update the following in backend/.env:"
echo "   1. MONGODB_URI - Replace with your MongoDB Atlas connection string"
echo "   2. JWT_SECRET - Change to a secure random string"
echo "   3. EMAIL_USER & EMAIL_PASS - Add your email credentials for password reset"
echo ""
echo "To get a free MongoDB Atlas database:"
echo "1. Go to https://www.mongodb.com/atlas"
echo "2. Create a free account"
echo "3. Create a new cluster"
echo "4. Get your connection string and replace the MONGODB_URI value"
echo ""
echo "After updating the .env file, run: npm run dev" 
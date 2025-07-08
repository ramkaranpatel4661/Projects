# Lost and Found Web Application

A comprehensive MERN stack web application for posting and finding lost/found items with real-time chat functionality.

## Features

- **Found Items**: Post items you've found with images, location, and contact details
- **Lost Items**: Post items you've lost with detailed descriptions
- **Browse Items**: View all posted items with search and filter capabilities
- **Real-time Chat**: Communicate with other users about specific items
- **User Authentication**: Secure registration and login system
- **Image Upload**: Upload and display images for items
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## Technology Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.io for real-time chat
- Multer for file uploads
- bcryptjs for password hashing

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Socket.io-client for real-time features
- Axios for API calls
- React Router for navigation
- Lucide React for icons

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lostfound
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

### MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. The application will connect to `mongodb://localhost:27017/lostfound`

#### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at https://mongodb.com/atlas
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your backend `.env` file

## Running the Application

1. Start MongoDB (if using local installation)
2. Start the backend server: `cd backend && npm run dev`
3. Start the frontend server: `cd frontend && npm run dev`
4. Open http://localhost:5173 in your browser

## Project Structure

```
Lost and Found/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   ├── uploads/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── index.html
└── README.md
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile

### Items
- GET `/api/items` - Get all items (found & lost)
- POST `/api/items/found` - Post found item
- POST `/api/items/lost` - Post lost item
- GET `/api/items/:id` - Get specific item
- PUT `/api/items/:id` - Update item
- DELETE `/api/items/:id` - Delete item

### Chat
- GET `/api/chat/:itemId` - Get chat messages for item
- POST `/api/chat/:itemId` - Send message

## Features in Detail

### Item Posting
- Upload multiple images per item
- Add detailed descriptions
- Specify location found/lost
- Add contact information
- Set item category and status

### Browse & Search
- View all items in a grid layout
- Filter by type (found/lost)
- Search by keywords
- Filter by category, location, date

### Real-time Chat
- Instant messaging between users
- Chat history preservation
- Online status indicators
- Message timestamps

### User Management
- Secure authentication
- User profiles with contact info
- View user's posted items
- Account settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
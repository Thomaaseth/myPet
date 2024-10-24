# MyPet Application

Full-stack application for managing pet-related activities.

## Structure

- `backend/`: Express.js and MongoDB backend
- `frontend/`: Next.js frontend

## Setup Instructions

### Backend
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with necessary environment variables
4. Run the server: `npm run dev`

### Frontend
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Environment Variables

### Backend
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Scripts

### Backend
- `npm run dev`: Run development server
- `npm start`: Run production server

### Frontend
- `npm run dev`: Run development server
- `npm run build`: Build for production
- `npm start`: Run production build
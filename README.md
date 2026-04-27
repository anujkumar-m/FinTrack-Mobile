# FinTrack Mobile 🚀

FinTrack is a comprehensive, full-stack personal finance management application. It features a modern, premium mobile frontend built with React Native (Expo) and a robust backend powered by Node.js, Express, and MongoDB.

## ✨ Features

- **Dashboard**: High-fidelity overview of your finances with visual charts and recent activity.
- **Transaction Tracking**: Log income and expenses with detailed categorization.
- **Budgeting & Savings**: Set savings goals and track your progress visually.
- **Bill Management**: Keep track of upcoming bills, EMIs, and dues.
- **Credit Cards**: Monitor credit card spending and limits.
- **Borrow/Lend Tracking**: Keep a ledger of money you owe or are owed.
- **Authentication**: Secure JWT-based login and registration system.
- **Premium UI**: Full dark mode support, glassmorphism elements, and smooth micro-animations.

## 🛠️ Tech Stack

**Frontend (Mobile App)**
- React Native
- Expo
- React Navigation (Bottom Tabs & Stack)
- React Query (Data Fetching & Caching)
- Expo Vector Icons (Ionicons)

**Backend (API)**
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for Authentication
- Helmet & Express-Rate-Limit for Security

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- [Expo Go](https://expo.dev/client) app installed on your iOS or Android device.

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/fintrack
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Mobile App Setup

1. Open a new terminal and navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `mobile` directory. Replace the IP address with your computer's local network IP (e.g., `192.168.1.x`):
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api
   ```
4. Start the Expo development server:
   ```bash
   npx expo start
   ```
5. Scan the QR code shown in the terminal using your phone's camera (iOS) or the Expo Go app (Android).

## 🌍 Deployment

### Deploying the Backend
The backend is configured for standard Node.js hosting environments (like Render, Heroku, or Vercel).
- Make sure to set `NODE_ENV=production` in your host's environment variables.
- Ensure `JWT_SECRET` and `MONGODB_URI` are properly configured in your host's dashboard.

### Deploying the Mobile App
The mobile app includes an `eas.json` configuration file, making it ready to build using Expo Application Services (EAS).
- Ensure `EXPO_PUBLIC_API_URL` is set to your live backend URL before building.
- Build for Android: `eas build -p android`
- Build for iOS: `eas build -p ios`

## 📝 License
MIT

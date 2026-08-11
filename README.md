# North South Group Backend

Backend API service for North South Group application.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm

## 🚀 Installation & Running

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   PORT=8000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/northsouthgroup
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=30d
   ```

4. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

## 🔌 API Endpoints

Base URL: `/api/v1`

### Features

#### 👤 Users
- Base Endpoint: `/api/v1/user`
- Manages user accounts and authentication.

#### 🏗️ Projects
- Base Endpoint: `/api/v1/project`
- Manages real estate projects.

#### 📰 News & Events
- Base Endpoint: `/api/v1/newsEvent`
- Handles company news and event updates.

#### 🌿 Green City
- Base Endpoint: `/api/v1/greenCity`
- Specific endpoints for Green City project data.

#### 🏙️ Square City
- Base Endpoint: `/api/v1/squareCity`
- Specific endpoints for Square City project data.

#### 🏭 Industrial City
- Base Endpoint: `/api/v1/industrialCity`
- Specific endpoints for Industrial City project data.

### 🛠️ Utility

- **Health Check**: `GET /health`
- **Server Root**: `GET /`
- **Static Uploads**: `/uploads/<filename>`

## 📁 Project Structure

All source code is located in the `src/` directory.

- `src/server.js`: Application entry point.
- `src/app.js`: Express app configuration.
- `src/routes/`: API route definitions.
- `src/controllers/`: Request handlers.
- `src/models/`: Database schemas.
- `src/middleware/`: Custom middleware.
- `src/uploads/`: Static file storage.

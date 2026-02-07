# Project Structure

## 📁 Directory Layout

```
reee/
│
├── frontend/                    # React Frontend Application
│   ├── src/                     # Source code
│   │   ├── components/          # React components
│   │   │   ├── JobDescription.js
│   │   │   ├── Result.js
│   │   │   ├── ResultPage.js
│   │   │   └── ResumeUpload.js
│   │   ├── config/              # Configuration
│   │   │   └── api.js           # API endpoints
│   │   ├── utils/               # Utility functions
│   │   ├── App.js               # Main App component
│   │   ├── App.css              # App styles
│   │   └── index.js             # Entry point
│   ├── public/                  # Public assets
│   │   ├── index.html           # HTML template
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── package.json             # Frontend dependencies
│   └── package-lock.json
│
├── backend/                     # Node.js/Express Backend API
│   ├── config/                  # Configuration
│   │   └── index.js             # Environment config
│   ├── controllers/             # Request handlers (MVC)
│   │   └── resumeController.js
│   ├── middleware/              # Custom middleware
│   │   ├── corsConfig.js        # CORS configuration
│   │   ├── errorHandler.js      # Error handling
│   │   └── uploadValidator.js   # File validation
│   ├── routes/                  # API routes
│   │   └── resumeRoutes.js     # Resume routes
│   ├── services/                # Business logic
│   │   ├── atsService.js        # ATS scoring logic
│   │   └── resumeService.js     # Resume processing
│   ├── utils/                   # Utility functions
│   │   ├── pdfExtractor.js      # PDF text extraction
│   │   ├── textProcessor.js     # Text processing
│   │   ├── similarityCalculator.js  # Similarity calculations
│   │   └── keywordMatcher.js    # Keyword matching
│   ├── server.js                # Backend entry point (ES modules)
│   ├── server.legacy.js         # Legacy server (CommonJS)
│   ├── package.json             # Backend dependencies
│   └── .env                     # Environment variables (create this)
│
├── sample resumes/              # Sample PDF files for testing
│
├── package.json                 # Root package.json with convenience scripts
├── README.md                     # Main documentation
├── SETUP.md                     # Setup instructions
└── .gitignore                   # Git ignore rules
```

## 🚀 Quick Commands

### From Root Directory

```bash
# Install all dependencies
npm run install:all

# Start backend
npm run start:backend

# Start frontend
npm run start:frontend

# Build frontend for production
npm run build:frontend
```

### From Individual Directories

**Backend:**
```bash
cd backend
npm install
npm start          # Production
npm run dev        # Development (with nodemon)
```

**Frontend:**
```bash
cd frontend
npm install
npm start          # Development server
npm run build      # Production build
```

## 📝 Key Files

### Frontend
- `frontend/src/App.js` - Main React application
- `frontend/src/config/api.js` - API endpoint configuration
- `frontend/package.json` - Frontend dependencies

### Backend
- `backend/server.js` - Main backend server (ES modules)
- `backend/config/index.js` - Configuration loader
- `backend/controllers/resumeController.js` - API controllers
- `backend/services/atsService.js` - ATS scoring logic
- `backend/package.json` - Backend dependencies

## 🔧 Configuration

### Backend Environment (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=10485760
MAX_FILES=10
KEYWORD_COUNT=30
COSINE_WEIGHT=0.5
KEYWORD_MATCH_WEIGHT=0.5
MAX_BOOST_POINTS=20
```

### Frontend Environment (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

## 📡 API Endpoints

- `GET /api/v1/resumes/health` - Health check
- `POST /api/v1/resumes/analyze` - Analyze resumes

## 🎯 Development Workflow

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend (new terminal):**
   ```bash
   cd frontend
   npm start
   ```

3. **Access:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📦 Dependencies

### Frontend
- React 19.1.0
- React Router 7.6.0
- Chart.js 4.4.9
- react-chartjs-2 5.3.0

### Backend
- Express 5.1.0
- pdf-parse 1.1.1
- natural 8.0.1
- Fuse.js 7.1.0
- express-fileupload 1.5.1
- dotenv 16.4.5

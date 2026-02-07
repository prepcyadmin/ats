# ATS Scanner - Industry-Grade Resume Analysis System

A professional Applicant Tracking System (ATS) that analyzes resumes against job descriptions using advanced NLP and machine learning techniques.

## 🏗️ Project Structure

```
reee/
├── frontend/          # React frontend application
│   ├── src/          # React source code
│   ├── public/       # Public assets
│   └── package.json  # Frontend dependencies
│
├── backend/          # Node.js/Express API
│   ├── config/      # Configuration files
│   ├── controllers/ # Request handlers
│   ├── middleware/   # Custom middleware
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── utils/        # Utility functions
│   ├── server.js     # Backend entry point
│   └── package.json  # Backend dependencies
│
└── package.json      # Root convenience scripts
```

## ✨ Features

- **Dynamic Scoring**: No hardcoded values - all scores calculated based on actual matches
- **Advanced NLP**: TF-IDF keyword extraction, cosine similarity, fuzzy matching
- **Industry-Grade Architecture**: MVC pattern, separation of concerns, proper error handling
- **RESTful API**: Clean, well-structured API endpoints
- **File Validation**: PDF validation, size limits, type checking
- **Error Handling**: Comprehensive error handling and validation
- **Environment Configuration**: Environment variables for easy configuration

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reee
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure Environment Variables**
   
   Create `backend/.env` file:
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

   Create `frontend/.env` (optional):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api/v1
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   # or for development with auto-reload:
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

2. **Start the Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /api/v1/resumes/health
```

### Analyze Resumes
```
POST /api/v1/resumes/analyze
Content-Type: multipart/form-data

Body:
- resumes: File[] (PDF files)
- jobDescription: string
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "resumeName": "resume.pdf",
        "matchPercentage": 85,
        "cosineSimilarity": "75.5",
        "keywordMatchScore": "80.0",
        "topKeywords": [...],
        "jobKeywords": [...],
        "keywordsCount": {...},
        "skills": {...},
        "resumeText": "..."
      }
    ],
    "totalProcessed": 5,
    "successful": 5,
    "failed": 0
  }
}
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env` to configure:
- **PORT**: Server port (default: 5000)
- **CORS_ORIGIN**: Allowed CORS origin
- **MAX_FILE_SIZE**: Maximum file size in bytes (default: 10MB)
- **MAX_FILES**: Maximum number of files per request
- **KEYWORD_COUNT**: Number of keywords to extract
- **COSINE_WEIGHT**: Weight for cosine similarity (0-1)
- **KEYWORD_MATCH_WEIGHT**: Weight for keyword matching (0-1)
- **MAX_BOOST_POINTS**: Maximum boost points for keyword matches

### Frontend Configuration

Edit `frontend/.env` to configure:
- **REACT_APP_API_URL**: Backend API URL

## 🧪 How It Works

1. **PDF Extraction**: Extracts text from uploaded PDF resumes
2. **Keyword Extraction**: Uses TF-IDF to extract important keywords from both resume and job description
3. **Similarity Calculation**: 
   - Cosine similarity between full texts
   - Keyword matching score (exact + fuzzy matches)
4. **Score Calculation**: 
   - Base score: Weighted combination of cosine similarity and keyword matching
   - Boost: Additional points for matching job requirements
5. **Ranking**: Resumes sorted by match percentage

## 📦 Project Structure Details

### Frontend (`frontend/`)
- **src/components/**: React components
- **src/config/**: API configuration
- **public/**: Static assets and HTML template

### Backend (`backend/`)
- **config/**: Configuration and environment variables
- **controllers/**: Request handlers (MVC pattern)
- **middleware/**: Custom middleware (error handling, validation, CORS)
- **routes/**: API route definitions
- **services/**: Business logic (ATS scoring, resume processing)
- **utils/**: Utility functions (PDF extraction, text processing, similarity)

## 🛠️ Technologies Used

### Backend
- Express.js - Web framework
- pdf-parse - PDF text extraction
- natural - NLP library
- Fuse.js - Fuzzy string matching
- express-fileupload - File upload handling
- dotenv - Environment variables

### Frontend
- React - UI library
- React Router - Routing
- Chart.js / react-chartjs-2 - Data visualization

## 📝 Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # React development server with hot reload
```

## 🚢 Production Build

### Frontend
```bash
cd frontend
npm run build
```
Builds the app for production to the `build` folder.

### Backend
```bash
cd backend
npm start
```

## 📄 License

ISC

## 📊 Feature Comparison & Roadmap

We've conducted a comprehensive comparison with industry-leading resume AI tools (Jobscan, Resume.io, TopResume) to identify missing features and improvement opportunities.

**📄 Documentation:**
- **[MISSING_FEATURES_SUMMARY.md](./MISSING_FEATURES_SUMMARY.md)** - Quick reference of missing features
- **[FEATURE_COMPARISON.md](./FEATURE_COMPARISON.md)** - Detailed comparison with industry standards
- **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** - Prioritized implementation plan

**🔴 Top Missing Features:**
1. Resume Formatting & ATS Compatibility Analysis
2. Actionable Recommendations Engine
3. Structured Resume Parsing
4. Resume Section Analysis
5. Keyword Density & Optimization

See the roadmap documents for implementation priorities and timelines.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

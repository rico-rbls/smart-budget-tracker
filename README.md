# 💰 Smart Budget Tracker

A full-stack budget tracking application built with React and Express.

## 📋 Project Structure

```
budget-tracker/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service calls
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Entry point
│   ├── .env               # Environment variables
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration files
│   │   ├── models/        # Database models
│   │   └── server.js      # Server entry point
│   ├── .env               # Environment variables
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd smart-budget-tracker
   ```

2. **Install dependencies**

   Frontend:

   ```bash
   cd client
   npm install
   ```

   Backend:

   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables**

   Frontend (`client/.env`):

   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

   Backend (`server/.env`):

   ```env
   PORT=3001
   DATABASE_URL=postgresql://username:password@localhost:5432/budget_tracker
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Set up the database**

   **Install PostgreSQL** (if not already installed):

   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   ```

   **Create and setup database**:

   ```bash
   # Create database
   createdb budget_tracker_db

   # Run migrations and seeds
   cd server
   npm run db:setup
   ```

   📖 **See [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md) for detailed instructions**

### Running the Application

1. **Start the backend server**

   ```bash
   cd server
   npm run dev
   ```

   Server will run on http://localhost:3002

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## 🔐 Authentication

The application includes a complete JWT-based authentication system:

- **User Registration** - Email/password with validation
- **User Login** - Secure credential verification
- **Protected Routes** - JWT token verification
- **Password Security** - Bcrypt hashing with 10 salt rounds
- **Token Expiration** - 7-day JWT tokens

### API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

📖 **See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for detailed documentation**

## 📸 Receipt Upload & OCR

The application includes automatic receipt processing with OCR:

- **File Upload** - Support for JPG, PNG, GIF, WEBP, PDF (max 5MB)
- **OCR Processing** - Tesseract.js for text extraction
- **Data Parsing** - Automatic extraction of merchant, amount, date, items
- **Auto-Categorization** - 70+ merchant patterns across 8 categories
- **Transaction Creation** - Automatically creates transactions from receipts

### API Endpoints

- `POST /api/receipts/upload` - Upload receipt image
- `GET /api/receipts` - Get all receipts
- `GET /api/receipts/:id` - Get specific receipt
- `DELETE /api/receipts/:id` - Delete receipt

📖 **See [RECEIPT_UPLOAD_GUIDE.md](RECEIPT_UPLOAD_GUIDE.md) for detailed documentation**

## 💰 Transaction Management

The application includes complete transaction CRUD operations with advanced features:

- **Manual Transactions** - Create, read, update, delete transactions
- **Advanced Filtering** - Filter by date, category, merchant, amount
- **Sorting** - Sort by date, amount, or merchant name
- **Pagination** - Efficient data loading with limit/offset
- **Statistics** - Comprehensive spending analytics and trends
- **Category Management** - Manually adjust auto-categorized transactions

### API Endpoints

- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/stats` - Get spending statistics

📖 **See [TRANSACTION_MANAGEMENT_GUIDE.md](TRANSACTION_MANAGEMENT_GUIDE.md) for detailed documentation**

## 📊 Budget Management

The application includes comprehensive budget tracking with alerts and spending analysis:

- **Budget Creation** - Set budgets for categories with different time periods
- **Budget Tracking** - Real-time budget vs actual spending comparison
- **Alert System** - 4-level alerts (safe, warning, exceeded, critical)
- **Period Support** - Weekly, monthly, yearly, or custom date ranges
- **Budget Status** - Detailed spending breakdown and percentage used
- **Duplicate Prevention** - One budget per category per period

### Budget Alert Levels

- **Safe** (< 80%) - Spending is under control
- **Warning** (80-99%) - Approaching budget limit ⚠️
- **Exceeded** (100-119%) - Over budget 🚨
- **Critical** (120%+) - Significantly over budget 🔴

### API Endpoints

- `POST /api/budgets` - Create budget
- `GET /api/budgets` - Get all budgets (with period filter)
- `GET /api/budgets/:id` - Get specific budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/status` - Get budget status with spending comparison

📖 **See [BUDGET_MANAGEMENT_GUIDE.md](BUDGET_MANAGEMENT_GUIDE.md) for detailed documentation**

## 🛠️ Tech Stack

### Frontend

- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **TailwindCSS** - Utility-first CSS framework
- **React Hook Form** - Form handling

### Backend

- **Express** - Web framework
- **PostgreSQL** - Database
- **node-postgres (pg)** - PostgreSQL client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **multer** - File upload handling
- **tesseract.js** - OCR text extraction

## 📝 Available Scripts

### Frontend (client/)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (server/)

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests

#### Database Scripts

- `npm run db:setup` - Run migrations and seeds (first-time setup)
- `npm run db:migrate` - Run only migrations
- `npm run db:seed` - Run only seeds
- `npm run db:reset` - ⚠️ Drop all tables, migrate, and seed
- `npm run db:fresh` - ⚠️ Drop all tables and migrate
- `npm run db:stats` - Show database statistics

## 🔐 Environment Variables

### Client

| Variable     | Description     | Default                   |
| ------------ | --------------- | ------------------------- |
| VITE_API_URL | Backend API URL | http://localhost:3001/api |

### Server

| Variable     | Description                  | Default     |
| ------------ | ---------------------------- | ----------- |
| PORT         | Server port                  | 3001        |
| DATABASE_URL | PostgreSQL connection string | -           |
| JWT_SECRET   | Secret key for JWT           | -           |
| NODE_ENV     | Environment mode             | development |

## 📦 Features (Planned)

- [ ] User authentication and authorization
- [ ] Budget creation and management
- [ ] Expense tracking
- [ ] Income tracking
- [ ] Category management
- [ ] Data visualization with charts
- [ ] Export data to CSV/PDF
- [ ] Recurring transactions
- [ ] Budget alerts and notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

# BrainMeal 🧠🍽️

BrainMeal is a modern web application for meal planning that helps users create personalized meal plans based on their preferences, dietary restrictions, and health goals.

## 🌟 Features

- 🔐 Firebase Authentication
- 📱 Responsive Design
- 🎨 Light & Dark Theme Support
- 📊 Personalized Meal Plans
- 📝 User Profile Management
- 🗄️ MongoDB Data Storage
- 🔄 Real-time Data Updates

## 🚀 Technologies

### Frontend
- React
- Vite
- Material-UI
- React Router
- Firebase Authentication
- Context API for State Management

### Backend
- Node.js
- Express
- MongoDB
- Firebase Admin SDK
- Winston for Logging

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Firebase Project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SCMARS/BrainMeal.git
cd BrainMeal
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Environment Setup:
```bash
# Create .env file in the root directory
cp .env.example .env

# Create .env file in the backend directory
cd backend
cp .env.example .env
```

4. Fill in the required environment variables in the `.env` files

### Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the backend:
```bash
cd backend
npm run dev
```

3. Start the frontend:
```bash
npm run dev
```

## 📁 Project Structure

```
BrainMeal/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── context/            # React context providers
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── utils/              # Utility functions
├── backend/                # Backend source code
│   ├── src/                # Backend source code
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── .env                # Backend environment variables
└── .env                    # Frontend environment variables
```

## 🔒 Security

- Firebase Authentication
- JWT Token API Protection
- Input Validation
- API Rate Limiting
- Secure Data Storage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## 📞 Contact

If you have any questions or suggestions, please create an issue in the repository or contact us.

---

Made with ❤️ by the BrainMeal Team

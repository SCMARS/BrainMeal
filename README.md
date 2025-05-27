# BrainMeal 🧠🍽️

BrainMeal is an intelligent nutrition planning web application that uses AI to create personalized meal plans based on user parameters, goals, and dietary preferences.

## 🚀 Technologies

- **Frontend:** React 18 + Vite
- **UI Framework:** Material-UI (MUI)
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage
- **Payments:** Stripe
- **AI:** Google Gemini AI
- **Charts:** Recharts
- **Animations:** Framer Motion

## ✨ Features

### Core Features
- 🎯 **Personalized Meal Planning** - AI-generated meal plans based on user goals
- 📊 **Nutrition Analytics** - Detailed tracking of calories, proteins, fats, and carbs
- 🏆 **Achievement System** - Gamified experience with progress tracking
- 💳 **Subscription Management** - Stripe-powered premium features
- 🌍 **Multi-language Support** - English and Russian languages
- 📱 **Responsive Design** - Mobile-first approach with bottom navigation

### Advanced Features
- 🤖 **AI-Powered Recommendations** - Smart meal suggestions
- 📈 **Progress Tracking** - Visual analytics and trends
- 🎨 **Beautiful UI/UX** - Dark theme with smooth animations
- 🔐 **Secure Authentication** - Firebase-based user management
- ☁️ **Cloud Storage** - Real-time data synchronization

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account
- Stripe account (for payments)
- Google AI API key (for Gemini)

### 1. Clone the repository
```bash
git clone https://github.com/your-repo/BrainMeal.git
cd BrainMeal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:
- Firebase configuration
- Stripe keys
- Google Gemini AI API key

### 4. Development
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

### 6. Preview Production Build
```bash
npm run preview
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure environment variables

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common components
│   └── layout/         # Layout components
├── context/            # React Context providers
├── pages/              # Page components
├── services/           # API and business logic
├── styles/             # Global styles
└── utils/              # Utility functions
```

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=

# AI
VITE_GEMINI_API_KEY=
```

## 📜 License
This project is licensed under the MIT License.

---
Developed by: [Hleb Ukhovskyi] (https://github.com/SCMARS)

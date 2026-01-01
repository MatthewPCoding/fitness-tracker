# 🏋️ FitTrack - Fitness & Meal Prep Tracker

A full-stack MERN application for tracking fitness goals, meals, and nutrition with personalized suggestions based on your fitness goal (Slimming, Bulking, or Maintaining).

## Features

- **Goal-Based System**: Slimming, Bulking, or Maintaining with auto-calculated targets
- **Meal Tracking**: Search Open Food Facts API (FREE!) or add custom foods
- **Progress Charts**: Weight trends and calorie intake visualization
- **Smart Suggestions**: Food recommendations based on remaining macros
- **Manual Override**: Option to set custom calorie/macro targets

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- No API keys needed! Uses Open Food Facts (free & open source)

### 2. Setup Server
```bash
cd server
npm install
cp .env.example .env  # Edit with your MongoDB URI
npm run dev
```

### 3. Setup Client
```bash
cd client
npm install
npm start
```

### 4. Open http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| PUT | /api/auth/goal | Switch fitness goal |
| POST | /api/auth/weight | Log weight |
| GET | /api/meals/search | Search foods |
| POST | /api/meals | Log meal |
| GET | /api/meals/suggestions | Get food suggestions |
| GET | /api/stats/dashboard | Dashboard data |

## Calorie Calculations

Uses **Mifflin-St Jeor** equation:
- **Slimming**: TDEE - 500 cal
- **Bulking**: TDEE + 400 cal  
- **Maintaining**: TDEE

Built for Mazzy's 2026 fitness journey 💪

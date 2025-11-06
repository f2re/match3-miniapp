# 🎮 Match-3 Telegram Mini App

> A fun Match-3 game built as a Telegram Mini App using React, TypeScript, Vite, and Phaser 3.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

## 📋 Table of Contents
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Features

- 🧩 Classic Match-3 puzzle gameplay
- 📱 Optimized for Telegram Mini App platform
- 🎨 Responsive design for all screen sizes
- 🔐 Secure user authentication
- 🏆 Leaderboards and achievements
- 🔄 Real-time game state synchronization
- 📊 Player statistics tracking
- 🎵 Sound effects and animations

## 🏗️ Project Structure

```
├── packages/
│   ├── client/                 # React + Vite + Phaser 3
│   │   ├── src/
│   │   │   ├── components/     # React UI Components
│   │   │   ├── game/          # Phaser Game Logic
│   │   │   │   ├── scenes/    # Game Scenes
│   │   │   │   ├── objects/   # Game Objects
│   │   │   │   └── utils/     # Game Utilities
│   │   │   ├── hooks/         # React Hooks
│   │   │   ├── services/      # API Services
│   │   │   ├── types/         # TypeScript Types
│   │   │   └── assets/        # Game Assets
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── .env
│   └── server/                # Node.js + Express + TypeScript
│       ├── src/
│       │   ├── controllers/   # API Controllers
│       │   ├── middleware/    # Express Middleware
│       │   ├── models/        # Data Models
│       │   ├── routes/        # API Routes
│       │   ├── services/      # Business Logic
│       │   ├── types/         # TypeScript Types
│       │   └── utils/         # Utilities
│       ├── package.json
│       ├── tsconfig.json
│       └── .env
├── shared/
│   └── types/                 # Shared TypeScript Interfaces
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore patterns
├── package.json             # Root package configuration
├── README.md                # Project documentation
└── setup.sh                 # Setup script
```

## 🛠️ Tech Stack

### Frontend
- [React 18](https://reactjs.org/) - Modern UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Fast build tool and dev server
- [Phaser 3](https://phaser.io/) - Game engine
- [@telegram-apps/sdk](https://github.com/Telegram-Apps-Documentation/telegram-apps-sdk) - Telegram Mini App integration
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Framer Motion](https://www.framer.com/motion/) - Smooth animations

### Backend
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe server code
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Mongoose](https://mongoosejs.com/) - ODM for MongoDB
- [JSON Web Tokens](https://jwt.io/) - Authentication
- [Helmet](https://helmetjs.github.io/) - Security middleware
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit) - Rate limiting

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (version 8 or higher)
- [MongoDB](https://www.mongodb.com/) (local installation or cloud instance)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd match3-miniapp
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables (see [Environment Variables](#-environment-variables))

4. Start the development servers:
   ```bash
   npm run dev
   ```

Your client will be running on `http://localhost:5173` and your server on `http://localhost:3000`.

## 🔐 Environment Variables

Create `.env` files in both client and server packages based on the `.env.example` files:

### Client Environment Variables

Create `packages/client/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_BOT_NAME=your_bot_name
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
```

### Server Environment Variables

Create `packages/server/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/match3
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NODE_ENV=development
```

## 📱 Development

### Client Development

Run the client in development mode:

```bash
npm run dev:client
```

### Server Development

Run the server in development mode:

```bash
npm run dev:server
```

### Running Both

Run both client and server in development mode:

```bash
npm run dev
```

## 🛠️ Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both client and server in development mode |
| `npm run dev:client` | Start only the client in development mode |
| `npm run dev:server` | Start only the server in development mode |
| `npm run build` | Build both client and server |
| `npm run build:client` | Build only the client |
| `npm run build:server` | Build only the server |
| `npm run install:all` | Install dependencies for all packages |
| `npm run lint` | Lint all packages |
| `npm run test` | Run tests for all packages |

## 🚀 Deployment

### Production Build

To create production builds:

```bash
npm run build
```

### Deployment Steps

1. Build the application: `npm run build`
2. Deploy the client build to a static hosting service
3. Deploy the server to a Node.js hosting platform
4. Configure your domain and SSL certificates
5. Set up environment variables on your hosting platform

## 🤝 Contributing

We welcome contributions to this project! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please make sure to update tests as appropriate.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

If you have any questions or need help, please open an issue in this repository.
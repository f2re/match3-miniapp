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
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Features

- 🧩 Classic Match-3 puzzle gameplay
- 📱 Optimized for Telegram Mini App platform
- 🎨 Responsive design for all screen sizes
- 🔐 Secure user authentication via Telegram
- 🏆 Leaderboards and achievements
- 🔄 Real-time game state synchronization
- 📊 Player statistics tracking
- 🎵 Sound effects and animations
- 🔄 Auto PWA support for offline play

## 🏗️ Project Structure

```
match3-miniapp/
├── packages/
│   ├── client/                 # React + Vite + Phaser 3
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/     # React UI Components
│   │   │   ├── game/          # Phaser Game Logic
│   │   │   │   ├── scenes/    # Game Scenes (BootScene, GameScene, MenuScene)
│   │   │   │   ├── objects/   # Game Objects (Tile, Board, etc.)
│   │   │   │   ├── utils/     # Game Utilities (match detection, animation helpers)
│   │   │   │   └── types/     # Game-specific TypeScript types
│   │   │   ├── hooks/         # React Hooks (useGameState, useTelegram, etc.)
│   │   │   ├── services/      # API Services (GameService, UserService)
│   │   │   ├── types/         # Shared TypeScript types
│   │   │   ├── assets/        # Game Assets (images, audio, etc.)
│   │   │   ├── App.tsx        # Main React component
│   │   │   └── main.tsx       # Entry point
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── .env
│   └── server/                # Node.js + Express + TypeScript
│       ├── scripts/           # Build and setup scripts
│       ├── src/
│       │   ├── controllers/   # API Controllers (UserController, GameDataController)
│       │   ├── database/      # Database configuration
│       │   ├── middleware/    # Express Middleware (auth, validation, error handling)
│       │   ├── models/        # Data Models (User, GameData)
│       │   ├── routes/        # API Routes (user routes, game routes)
│       │   ├── services/      # Business Logic (GameService, AuthService)
│       │   ├── types/         # Shared TypeScript types
│       │   ├── utils/         # Utilities (validation, helpers)
│       │   └── index.ts       # Server entry point
│       ├── knexfile.js        # Knex.js database configuration
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env
│       └── .env.example
├── shared/
│   └── types/                 # Shared TypeScript Interfaces between client and server
├── .gitignore                 # Git ignore patterns
├── .env.example               # Environment variables template
├── .eslintrc.json             # ESLint configuration
├── .prettierrc                # Prettier configuration
├── CONTRIBUTING.md            # Contribution guidelines
├── LICENSE                    # MIT License
├── README.md                  # Project documentation
├── package.json              # Root package configuration with workspace setup
└── setup.sh                  # Setup script for initial installation
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
- [Vite PWA Plugin](https://vite-plugin-pwa-org.translate.goog/) - PWA capabilities

### Backend
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe server code
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Knex.js](https://knexjs.org/) - SQL query builder
- [JSON Web Tokens](https://jwt.io/) - Authentication
- [Helmet](https://helmetjs.github.io/) - Security middleware
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit) - Rate limiting
- [tsconfig-paths](https://www.npmjs.com/package/tsconfig-paths) - Path aliasing

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (version 8 or higher)
- [PostgreSQL](https://www.postgresql.org/) (local installation or cloud instance)

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

4. Set up the database (see [Database Setup](#-database-setup))

5. Start the development servers:
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
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=match3
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
NODE_ENV=development
```

## 🗄️ Database Setup

This project uses PostgreSQL with Knex.js as a query builder. After setting up your environment variables:

1. Initialize the database:
   ```bash
   cd packages/server
   npm run setup
   ```

This command will:
- Create the required environment file if it doesn't exist
- Initialize the database connection
- Run migrations to create the necessary tables

2. To run migrations manually:
   ```bash
   cd packages/server && npm run migrate
   ```

3. To create a new migration:
   ```bash
   cd packages/server && npm run migrate:make migration_name
   ```

4. To rollback the last migration:
   ```bash
   cd packages/server && npm run migrate:rollback
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

### Code Formatting

Format the codebase with Prettier:

```bash
npm run format
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
| `npm run format` | Format all files with Prettier |
| `npm run setup` | Run server setup (init-env and init-db) |

## 🚀 Deployment

### Production Build

To create production builds:

```bash
npm run build
```

### Server Deployment

1. Build the application: `npm run build`
2. Deploy the server to a Node.js hosting platform (e.g., Heroku, AWS, DigitalOcean)
3. Set up environment variables on your hosting platform
4. Ensure PostgreSQL is accessible from your production environment

### Client Deployment

1. Build the application: `npm run build`
2. Deploy the client build (from `packages/client/dist`) to a static hosting service (e.g., Vercel, Netlify, GitHub Pages)
3. Configure your domain and SSL certificates

### Docker Deployment

The application can also be deployed using Docker. Create a multi-stage Dockerfile with both client and server components.

## 🧪 Testing

To run tests across the entire project:

```bash
npm run test
```

Each package may have its own test configuration specific to its functionality. The project uses standard testing approaches for both client and server components.

## 🤝 Contributing

We welcome contributions to this project! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure the code is formatted with `npm run format`
5. Add or update tests as appropriate
6. Commit your changes using conventional commits format
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on code standards and the process we follow.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

If you have any questions or need help, please open an issue in this repository.
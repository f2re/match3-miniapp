# Match-3 Telegram Mini App - Project Documentation

## Table of Contents
- [Code Styles](#code-styles)
- [Project Structure](#project-structure)
- [Main Logic and Principles](#main-logic-and-principles)
- [Requirements](#requirements)
- [Limitations](#limitations)

## Code Styles

### TypeScript/JavaScript
- Use TypeScript for all new code to ensure type safety
- Follow functional programming patterns where possible
- Use ES2020+ features (since Node.js 18+ is required)
- Use const over let when the variable doesn't change
- Use arrow functions in callbacks and event handlers
- Use async/await instead of promises when possible
- Use destructuring when accessing multiple properties of an object
- Follow the "prefer-const" ESLint rule
- Use meaningful variable and function names
- Write JSDoc comments for exported functions and complex logic

### React Components
- Use functional components with hooks
- Use TypeScript interfaces for props and state
- Keep components small and focused on a single responsibility
- Use custom hooks for shared logic
- Follow the file naming convention: PascalCase for components
- Use React 18 features like Concurrent Mode when appropriate
- Follow React best practices for performance optimization

### Phaser 3 Game Code
- Use ES6 classes for game scenes and objects
- Implement proper game states and scene management
- Use Phaser's built-in physics systems for animations where possible
- Implement proper asset loading and caching strategies
- Separate game logic from rendering logic
- Use Phaser's event system for communication between objects
- Follow Match-3 game development patterns and best practices

### Backend (Node.js/Express)
- Use TypeScript for all server-side code
- Implement proper error handling and logging
- Use async/await for all asynchronous operations
- Follow REST API best practices for endpoint design
- Use middleware for common operations like authentication
- Implement proper database connection management
- Use environment variables for configuration

### File and Directory Naming
- Use kebab-case for file names (e.g., game-scene.ts)
- Use PascalCase for component and class names (e.g., GameScene.tsx)
- Use camelCase for variable and function names (e.g., createBoard)
- Group related files in appropriate directories
- Use clear and descriptive names that reflect the purpose of the file

### Git
- Use conventional commits format
- Keep commits small and focused
- Write clear, descriptive commit messages
- Use semantic versioning for releases

## Project Structure

```
match3-miniapp/
├── packages/
│   ├── client/                 # React + Vite + Phaser 3
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── components/     # React UI Components
│   │   │   │   ├── GameBoard.tsx
│   │   │   │   ├── GameUI.tsx
│   │   │   │   └── ...
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
│       ├── src/
│       │   ├── controllers/   # API Controllers (UserController, GameDataController)
│       │   ├── middleware/    # Express Middleware (auth, validation, error handling)
│       │   ├── models/        # Data Models (User, GameData)
│       │   ├── routes/        # API Routes (user routes, game routes)
│       │   ├── services/      # Business Logic (GameService, AuthService)
│       │   ├── types/         # Shared TypeScript types
│       │   ├── utils/         # Utilities (validation, helpers)
│       │   └── index.ts       # Server entry point
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

## Main Logic and Principles

### Architecture Principles
- **Modularity**: The application follows a modular architecture with clear separation of concerns between client and server
- **Maintainability**: Code is organized to facilitate easy maintenance and updates
- **Scalability**: Architecture supports growth in features and users
- **Security**: Security is implemented at multiple layers (authentication, authorization, input validation)
- **Performance**: Optimized for fast loading and smooth gameplay

### Game Logic
- **Match-3 Mechanics**: Core gameplay involves matching 3 or more similar items
- **Grid Management**: Dynamic grid that handles tile swapping, matching detection, and cascading effects
- **State Management**: Game state is managed using Zustand for React components and Phaser's built-in state management
- **Animation System**: Smooth animations for tile movement, matching, and cascading using Phaser and Framer Motion
- **Scoring System**: Points calculated based on matches, combos, and special moves

### Data Flow
- **Client-Server Communication**: API calls to server for user authentication and game data
- **State Synchronization**: Game state synchronized between client and server
- **Real-time Updates**: WebSocket or similar technology for real-time multiplayer features (if implemented)

### Telegram Mini App Integration
- **Telegram SDK**: Integration with @telegram-apps/sdk for platform-specific features
- **User Authentication**: Leveraging Telegram's user authentication
- **Platform Features**: Use of Telegram-specific UI components like MainButton
- **Theme Adaptation**: Dynamic theming based on Telegram's theme

### Technology Choices
- **React + TypeScript**: For building the user interface with type safety
- **Phaser 3**: For game rendering and mechanics
- **Vite**: For fast development and build process
- **Node.js + Express**: For backend API
- **MongoDB + Mongoose**: For data persistence
- **JWT**: For authentication
- **Zustand**: For state management
- **Framer Motion**: For UI animations

## Requirements

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **MongoDB**: Version 4.4 or higher (local installation or cloud instance)

### Development Environment
- **OS**: macOS, Linux, or Windows
- **IDE**: Recommended VS Code with TypeScript extensions
- **Git**: Version control system

### Dependencies
- **Client**:
  - React 18+
  - TypeScript 5+
  - Phaser 3
  - Vite 4+
  - @telegram-apps/sdk
  - Zustand 4+
  - Framer Motion 10+
- **Server**:
  - Node.js 18+
  - Express 4+
  - TypeScript 5+
  - MongoDB driver
  - Mongoose
  - JSON Web Tokens
  - CORS
  - Helmet
  - Rate limiting

### Runtime Requirements
- **Memory**: Minimum 8GB RAM recommended for development
- **Storage**: ~2GB available space for dependencies and build artifacts
- **Network**: Internet connection for initial setup and API requests

### Deployment Requirements
- **Client Hosting**: Static file hosting service (Vercel, Netlify, etc.)
- **Server Hosting**: Node.js runtime environment
- **Database**: MongoDB-compatible database service
- **Environment Variables**: Properly configured environment variables for production

## Limitations

### Technical Limitations
- **Browser Compatibility**: Requires modern browser features; may not work on very old browsers
- **Mobile Performance**: Performance on low-end devices may be limited by JavaScript game engine
- **File Size**: Phaser 3 bundle size may be large for some mobile connections
- **Memory Usage**: Phaser games can be memory-intensive, especially on mobile devices

### Platform Limitations
- **Telegram Web Apps**: Subject to Telegram's platform limitations and API changes
- **WebView Restrictions**: Some browser features may be limited in Telegram's WebView
- **Offline Mode**: Limited offline functionality (progress may be lost without server sync)
- **Background Processing**: Game state may be affected when app is in background

### Game Design Limitations
- **Board Size**: Limited by screen real estate and performance considerations
- **Animation Complexity**: Complex animations may impact performance on lower-end devices
- **Simultaneous Players**: Current architecture assumes single-player; multiplayer requires additional implementation

### Security Limitations
- **Client-Side Security**: Game logic is visible to users; sensitive logic must be server-side
- **Cheating Prevention**: Client-side validation can be bypassed
- **Data Privacy**: Game state passed via URL or headers could potentially be intercepted

### Scalability Limitations
- **Database Performance**: Simple MongoDB setup may need optimization for large user bases
- **Concurrent Users**: Server may need load balancing for high-traffic scenarios
- **Asset Delivery**: Static asset optimization needed for global distribution

### Development Limitations
- **Monorepo Complexity**: Managing dependencies across packages may become complex
- **Build Time**: As project grows, build times may increase
- **Testing**: Game-specific testing may require custom test frameworks
- **Debugging**: Debugging across multiple packages and game engine can be challenging
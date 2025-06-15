# AI Chat Application

A modern AI-powered chat application with embedded widget capabilities.

## Features

- **User Authentication**: Secure JWT-based authentication system
- **Real-time Chat**: Interactive chat interface with AI responses
- **Admin Dashboard**: Comprehensive admin panel for managing FAQs and users
- **FAQ Management**: Dynamic FAQ system with CRUD operations
- **Embedded Widget**: Customizable chat widget for external websites
- **Rate Limiting**: Redis-based rate limiting for API protection
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

### Backend (ai-chat-api)
- **Express.js** + TypeScript
- **Prisma** ORM with SQLite database
- **JWT** authentication
- **bcrypt** for password hashing
- **Helmet** for security headers
- **CORS** configuration
- **Redis** for rate limiting

### Frontend (ai-chat-ui)
- **Next.js** (Pages Router)
- **React** + TypeScript
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Cookie-based** session management

## Quick Start

### Prerequisites
- Node.js 18+
- Yarn package manager
- Redis server (for rate limiting)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chat
```

2. Install dependencies for both projects:
```bash
yarn install:all
```

3. Set up environment variables:
```bash
# ai-chat-api/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_API_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"

# ai-chat-ui/.env.local
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

4. Initialize the database:
```bash
cd ai-chat-api
npx prisma migrate deploy
npx prisma db seed
cd ..
```

5. Start development servers:
```bash
yarn dev
```

The API will be available at `http://localhost:8000` and the UI at `http://localhost:3000`.

## 🚀 Development Workflow

This project uses automated code quality checks on every commit:

### Pre-commit Hooks
- **Format**: Automatically formats code using Prettier
- **Lint**: Checks code quality using ESLint  
- **Build**: Ensures both API and UI compile successfully

### Available Scripts

#### Root Level (manages both projects)
```bash
yarn install:all    # Install dependencies for both projects
yarn dev            # Run both API and UI in development mode
yarn build          # Build both projects
yarn lint           # Lint both projects
yarn format         # Format code in both projects
yarn check:all      # Run format, lint, and build
```

#### API Project (ai-chat-api/)
```bash
yarn dev            # Start API development server
yarn build          # Build API
yarn lint           # Lint API code
yarn format         # Format API code
```

#### UI Project (ai-chat-ui/)
```bash
yarn dev            # Start Next.js development server
yarn build          # Build Next.js app
yarn lint           # Lint UI code
yarn format         # Format UI code
```

### Quality Assurance
Every commit automatically runs:
1. Code formatting with Prettier
2. Linting with ESLint
3. TypeScript compilation check
4. Build verification

This ensures consistent code quality and prevents broken commits from entering the repository.

## Project Structure

```
├── ai-chat-api/           # Express.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── utils/         # Utility functions
│   │   └── lib/           # Library configurations
│   ├── prisma/            # Database schema and migrations
│   └── package.json
├── ai-chat-ui/            # Next.js frontend
│   ├── pages/             # Next.js pages
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   └── styles/            # CSS styles
├── demo-widget.html       # Widget demo page
└── package.json           # Root package.json for scripts
```

## Embedded Widget

The application includes a customizable embedded chat widget that can be integrated into any website:

### Integration

1. Generate a widget in the admin dashboard
2. Copy the provided embed code:
```html
<script src="https://your-domain.com/widget-loader/WIDGET_KEY.v1.js"></script>
```
3. Paste the code into your website

### Features
- Customizable accent colors
- Logo upload support
- Rate limiting protection
- Responsive design
- Cross-origin security

## Deployment

### Docker Setup

Both applications include Docker configurations for easy deployment:

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up
```

### Environment Configuration

Make sure to set the following environment variables in production:

- `JWT_SECRET`: Strong secret for JWT tokens
- `DATABASE_URL`: Production database connection
- `REDIS_URL`: Redis server URL
- `NEXT_PUBLIC_API_URL`: Public API endpoint
- `FRONTEND_URL`: Frontend domain for CORS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass: `yarn check:all`
5. Submit a pull request

The pre-commit hooks will automatically format, lint, and build your code before committing.

## License

This project is licensed under the MIT License. 
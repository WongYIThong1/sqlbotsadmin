# Admin dashboard

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/wongyithongs-projects/v0-admin-dashboard)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/uk3CMHpgW7w)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/wongyithongs-projects/v0-admin-dashboard](https://vercel.com/wongyithongs-projects/v0-admin-dashboard)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/uk3CMHpgW7w](https://v0.app/chat/uk3CMHpgW7w)**

## Environment Setup

Before running the project, you need to configure environment variables. See [ENV_SETUP.md](ENV_SETUP.md) for detailed instructions.

### Quick Setup

1. Create a `.env.local` file in the root directory
2. Add the required environment variables (see `ENV_SETUP.md`)
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`

### Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous API key
- `JWT_SECRET` - Secret key for JWT token signing (min 32 characters)
- `JWT_EXPIRES_IN` - JWT token expiration time (default: 24h)

## Authentication System

This project includes a complete authentication system with:

- JWT-based authentication with HTTP-only cookies
- Route protection via Next.js middleware
- Session verification and timeout handling
- Secure logout functionality
- Protected routes: `/dashboard`, `/user`, `/license`, `/version`, `/logs`, `/security-logs`, `/team-manage`

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
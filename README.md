# NexSkill ??

**Peer Skill Exchange & AI Verification Platform**

A full-stack web application where users can exchange skills, verify expertise with AI, chat in real-time, track progress, and join a gamified learning community.

## Features

- ?? Peer-to-peer skill exchange requests
- ?? AI-powered skill assessment & verification
- ?? Real-time chat with Socket.io
- ?? Progress tracking & leaderboard
- ?? Push notifications (Web Push / VAPID)
- ?? Gamification & badges
- ?? Meeting scheduler
- ?? Community forum
- ?? PWA (installable on mobile)
- ?? JWT authentication

## Tech Stack

- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL (Supabase), SQLite (local fallback)
- **Auth**: JWT, bcryptjs
- **Email**: Resend
- **Push**: Web Push (VAPID)
- **AI**: Integrated AI service
- **Deployment**: Render (HTTPS)

## Environment Variables

Copy .env.example and fill in your values:

| Variable | Description |
|----------|-------------|
| JWT_SECRET | Secret key for JWT signing |
| RESEND_API_KEY | Resend email API key |
| APP_URL | Your deployed app URL |
| SUPABASE_URL | Supabase project URL |
| SUPABASE_ANON_KEY | Supabase anonymous key |
| SUPABASE_SERVICE_KEY | Supabase service role key |
| DATABASE_URL | PostgreSQL connection string |
| VAPID_PUBLIC_KEY | Web Push VAPID public key |
| VAPID_PRIVATE_KEY | Web Push VAPID private key |

## Local Development

`ash
npm install
npm run dev
`

Visit: https://localhost:5000

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

This repo includes a ender.yaml for one-click deployment.

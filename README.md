# Modelia Mini AI Studio — README

## Prereqs
- Node 18+, npm
- Docker & docker-compose (optional)
- SQLite (or PostgreSQL if selected)

## Env
Copy `.env.example` to `.env` and set:
- JWT_SECRET
- DATABASE_URL

## Local dev (two terminal tabs)
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

## Running tests
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test

## Docker (optional)
docker-compose up --build

## Submission
Create a public GitHub repo, open 2+ PRs (feature + tests), include EVAL.md, OPENAPI.yaml, AI_USAGE.md, README, and email all deliverables to frontend@modelia.ai



## Reference
https://medium.com/@udaykumardhokia/setting-up-a-node-js-backend-with-typescript-the-complete-beginners-guide-8bc380324406
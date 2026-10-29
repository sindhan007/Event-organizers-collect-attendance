# Gatherwell Event Analytics

Gatherwell helps event organizers evaluate success beyond registration counts. It connects attendance, feedback coverage, sentiment, return intent, and engagement into an event-health view with practical recommendations for the next event.

## Problem Statement

Organizers often collect attendance and feedback in separate spreadsheets and forms, then make planning decisions without a meaningful view of engagement. Important signals such as response rate, attendee sentiment, and repeat intent are difficult to compare across events.

## Proposed Solution

Gatherwell provides one organizer workspace for event records, attendee check-in, feedback, analytics, CSV imports, and evidence-based planning. The application turns raw participation data into a readable event score and next actions.

## Technology Stack

- Frontend: React, Vite, CSS, Nginx for production serving
- Backend: Node.js, Express 5, Mongoose
- Database: MongoDB
- Authentication: bcrypt password hashing, JWT sessions, Google OAuth 2.0
- AI: OpenAI-compatible chat-completions adapter for event-description autocomplete
- Testing: Vitest
- API documentation: Bruno collection
- Deployment configuration: Render Blueprint and Netlify configuration
- Containerization: Docker Compose with API, web, and MongoDB services

## Architecture Overview

```text
React/Vite client
    | JWT bearer requests and multipart CSV upload
    v
Express API
    | Mongoose models and protected auth routes
    +--> MongoDB
    +--> Google OAuth provider
    +--> OpenAI-compatible autocomplete provider
```

The client uses `VITE_API_URL` to reach the API. The API owns validation, authentication, file parsing, relationship population, and database writes. Secrets are supplied through environment variables and are not committed.

## Key Features

- Event dashboard with engagement, attendance, feedback, and return-intent metrics
- Event create, update, delete, attendee registration, and check-in workflows
- Feedback collection and relationship-aware event detail responses
- Username/password authentication with bcrypt and JWT
- Google OAuth sign-in that hands off to the same JWT session
- Authenticated CSV upload for attendee and feedback data
- AI-assisted event-description autocomplete through a provider-agnostic endpoint
- Responsive React UI with reusable metric, chart, health, event, and auth components
- Bruno requests for all current API endpoints
- Vitest unit coverage for model validation and JWT behavior

## Installation Instructions

Prerequisites: Node.js 22+, npm, MongoDB, and optionally Docker Desktop.

```bash
git clone https://github.com/sindhan007/Event-organizers-collect-attendance.git
cd Event-organizers-collect-attendance
cd server
npm install
cd ../client
npm install
```

## Environment Setup

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/gatherwell
JWT_SECRET=use-a-long-random-secret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=optional-google-client-id
GOOGLE_CLIENT_SECRET=optional-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=optional-ai-provider-key
AI_MODEL=gpt-4o-mini
```

For the frontend, set `VITE_API_URL` when the API is not running on `http://localhost:5000`. Never commit `.env` files or real API keys. Google and AI features return a clear configuration error until their provider variables are set.

## Running the Project

Start MongoDB, then use two terminals:

```bash
# terminal 1
cd server
npm start

# terminal 2
cd client
npm run dev
```

Open `http://localhost:5173`. Check the API at `http://localhost:5000/health`.

For the full containerized stack:

```bash
docker compose up --build
```

Then open `http://localhost:8080`. See [DOCKER.md](DOCKER.md) for the service layout.

## API Surface

The Bruno collection in `bruno/gatherwell` documents the current API. The main groups are:

- Auth: register, login, current user, Google start/callback
- Events: list, create, detail, update, analytics
- Attendees: list, register, update, check-in
- Feedback: list and submit
- Import: authenticated CSV upload
- AI: authenticated event-description autocomplete

## Deployment Links

- Public Mock UX preview: https://htmlpreview.github.io/?https://raw.githubusercontent.com/sindhan007/Event-organizers-collect-attendance/feature/mock-ux-design/mock-ux/index.html
- Repository: https://github.com/sindhan007/Event-organizers-collect-attendance
- Backend deployment configuration: [render.yaml](render.yaml)
- Frontend deployment configuration: [netlify.toml](netlify.toml)

Render and Netlify service URLs must be added after the services are provisioned. The repository contains reproducible deployment configuration, but no live Render or Netlify URL has been provisioned in this environment.

## Mock UX Design

The clickable prototype covers the primary screens, navigation flow, event health review, attendee feedback, and action planning:

https://htmlpreview.github.io/?https://raw.githubusercontent.com/sindhan007/Event-organizers-collect-attendance/feature/mock-ux-design/mock-ux/index.html

## Folder Structure

```text
client/                 React/Vite application and Netlify build
server/models/          Mongoose entities and relationships
server/src/             Express app, auth, database, AI, and upload logic
server/tests/           Vitest unit tests
bruno/gatherwell/       Bruno API request collection and local environment
mock-ux/                Clickable UX prototype
docker-compose.yml      Local full-stack container orchestration
render.yaml             Render backend Blueprint
netlify.toml            Netlify frontend build configuration
```

## Testing

```bash
cd server
npm test
npm run check-models
npm run check-api
```

The test suite contains seven database-model and authentication unit tests and does not require a live MongoDB connection.

## Future Improvements

- Add end-to-end tests against an isolated MongoDB instance
- Add role-based access control and organizer ownership checks to every event route
- Add background processing for large CSV imports
- Add refresh-token rotation and secure cookie sessions for production deployments
- Add live analytics charts backed by persisted event data
- Provision and verify production Render, MongoDB, Netlify, Google OAuth, and AI provider services

## Contributors

- Sindhan, project owner and developer

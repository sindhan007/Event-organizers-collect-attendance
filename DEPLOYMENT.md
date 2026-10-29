# Render Backend Deployment

The repository includes `render.yaml` for the Gatherwell API. It deploys the `server/` package with `npm install`, starts it with `npm start`, and checks `GET /health`.

## Required Render environment variables

Set these in the Render dashboard before the first deploy:

- `MONGODB_URI`: production MongoDB connection string
- `CLIENT_URL`: deployed frontend URL

The Blueprint generates `JWT_SECRET`. Set the Google OAuth variables only when Google sign-in is enabled:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`: `https://<render-service>.onrender.com/api/auth/google/callback`

## Deploy

1. Sign in to Render with the Kalvium Google account.
2. Select **New > Blueprint** and choose this GitHub repository.
3. Select the branch containing `render.yaml`.
4. Review the `gatherwell-api` web service and add the required environment variables.
5. Create the Blueprint and wait for the health check to pass.
6. Verify `https://<render-service>.onrender.com/health` returns the API health JSON.

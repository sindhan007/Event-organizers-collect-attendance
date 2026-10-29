# Netlify Frontend Deployment

The repository includes `netlify.toml` configured for the Vite app in `client/`.

## Deploy from Git

1. Sign in to Netlify with the account used for the capstone.
2. Select **Add new site > Import an existing project**.
3. Choose `sindhan007/Event-organizers-collect-attendance`.
4. Select the branch containing `netlify.toml`.
5. Netlify will use `npm run build` in `client/` and publish `client/dist`.
6. Add `VITE_API_URL` in Site configuration > Environment variables, using the deployed Render API URL.
7. Deploy the site and verify the homepage and Events upload view.

The SPA redirect in `netlify.toml` keeps client-side navigation working on refresh.

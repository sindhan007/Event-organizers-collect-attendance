# Dockerized Gatherwell

The full stack runs with Docker Compose:

- `web`: Vite React build served by Nginx at `http://localhost:8080`
- `api`: Node/Express API at `http://localhost:5000`
- `mongo`: MongoDB with a named persistent volume

## Run locally

```bash
docker compose up --build
```

Open `http://localhost:8080` to showcase the frontend. Check `http://localhost:5000/health` for the API health response. Stop the stack with:

```bash
docker compose down
```

The Compose JWT secret is for local demonstration only. Use a strong secret and external environment variables for shared or production deployments. The frontend image receives `VITE_API_URL` at build time through the Compose build argument.

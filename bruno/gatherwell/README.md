# Gatherwell API Bruno Collection

Select the `local` environment and replace `token`, `eventId`, and `attendeeId` with values from your local API. Start the server with `npm start` from `server/`.

The collection documents all 18 current endpoints:

- Health: `GET /health`
- Authentication: Google start/callback, register, login, and current user
- Events: list, create, detail, update, and analytics
- Attendees: list, create, update, check-in
- Feedback: list and create
- Imports: authenticated CSV upload

The CSV upload request expects a file with `email` and `name` columns. Optional columns are `checkedIn`, `rating`, `comment`, and `returnIntent`.

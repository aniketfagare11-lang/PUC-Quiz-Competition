# Avishkar 5.0 Quiz Competition

A production-ready web-based quiz competition platform for PUC students, featuring team authentication, a timed quiz, four question sets (A, B, C, D), and an admin dashboard.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Authentication: JWT and bcrypt

## Project Structure

```text
PUC-Quiz-Competition/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seed.js
│   └── server.js
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB Atlas connection string

## Backend Setup

1. Open the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file inside `backend/` using the required environment variables:

   Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`,
   `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `CLIENT_URL`.
   Use a long random JWT secret and never commit actual credentials.

4. Start the backend using the script configured in `backend/package.json`, for example:

   ```bash
   npm start
   ```

For local development, `npm run dev` starts the nodemon watcher.

## API Base URL

The local API is `http://localhost:5000/api`. In production, deploy the
backend at an HTTPS URL and set that URL in the frontend build environment as
`VITE_API_URL` (for example, `https://quiz-api.example.com`). Do not include a
trailing slash. The frontend uses relative `/api` requests when this variable
is empty, which is suitable when a production reverse proxy serves both the
frontend and backend under the same origin.

### Team APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/teams/availability` | Check team availability |
| POST | `/teams/session` | Validate team and participants |
| POST | `/teams/register` | Register a team |
| POST | `/teams/login` | Team login |
| GET | `/teams/me` | Get authenticated team details |

### Quiz APIs

All attempt endpoints require a team JWT token.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/attempts/start` | Start a quiz attempt |
| GET | `/attempts/:id` | Retrieve attempt state and questions |
| PUT | `/attempts/:id/answer` | Save an answer |
| POST | `/attempts/:id/submit` | Submit the quiz |

Include the team token in the request header:

```text
Authorization: Bearer <team_token>
```

Answer submission body:

```json
{
  "questionId": "QUESTION_ID",
  "selectedOption": "A"
}
```

Use the exact request formats expected by the backend controllers.

### Admin APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/login` | Admin login |
| GET | `/admin/active-set` | View the active question set |
| PUT | `/admin/active-set` | Change the active question set |

New quiz attempts receive Sets A-D automatically in a randomized, balanced
cycle. The assignment is claimed atomically in MongoDB and is persisted on the
attempt. Existing attempts retain their assigned set. The admin active-set
configuration remains available for manual or legacy administration but does
not control automatic assignment.

Admin-protected routes require an admin JWT token.

Registration accepts `collegeName`, `member1Name`, and `member2Name`. The backend
assigns the next unique team number automatically; the participant does not
submit a team number. A successful registration returns the assigned team and
the team JWT used by the quiz routes.

## Question Sets

The platform supports four sets:

- Set A
- Set B
- Set C
- Set D

When a team starts a quiz, its assigned set is saved to the attempt.

## Important Notes

- The competition uses one quiz.
- Correct answers must never be exposed to the frontend.
- The backend controls scoring, timing, and submission.
- Keep `.env` and all secrets out of Git.
- `backend/seed.js` loads the four source-backed Avishkar papers as Sets A, B, C,
  and D, with 50 questions per set. It also initializes the active set to A and
  creates the configured admin account without modifying teams, attempts, or results.
- Configure `CLIENT_URL` on the backend to the exact frontend origin(s), comma-separated if needed.
- Configure `VITE_API_URL` before building the frontend when the backend is hosted on a different origin.
- Configure SPA fallback routing on the frontend host so `/quiz`, `/admin`, and `/done` serve `index.html`.

## Frontend Deployment

From the frontend directory:

```bash
npm install
npm run build
```

Serve the generated `frontend/dist` directory from a static host with SPA
fallbacks enabled. Set `VITE_API_URL` in the hosting provider's build
environment before running the build.

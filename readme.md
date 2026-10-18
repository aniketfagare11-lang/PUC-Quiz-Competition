# PUC Quiz Competition

A web-based quiz competition platform for PUC students, featuring team authentication, timed quizzes, four question sets (A, B, C, D), and an admin dashboard.

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

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

   Add any other environment variables required by your existing backend configuration. Never commit actual credentials.

4. Start the backend using the script configured in `backend/package.json`, for example:

   ```bash
   npm run dev
   ```

## API Base URL

```text
http://localhost:5000/api
```

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

Changing the active set affects new attempts. Existing attempts retain their assigned set.

Admin-protected routes require an admin JWT token.

## Question Sets

The platform supports four sets:

- Set A
- Set B
- Set C
- Set D

The admin selects which set is active. When a team starts a quiz, its assigned set is saved to the attempt.

## Important Notes

- The competition uses one quiz round.
- Correct answers must never be exposed to the frontend.
- The backend controls scoring, timing, and submission.
- Keep `.env` and all secrets out of Git.
- The current database contains temporary test questions. Replace them with the approved competition questions before the event.
- `localhost` is for local development; configure the deployed API URL for production.

## Frontend Integration

The frontend developer should:

1. Connect team registration/session and login screens.
2. Store and send the team JWT securely.
3. Display questions returned by the attempt API.
4. Send selected answers to the backend.
5. Display the timer and handle automatic or manual submission.
6. Build the admin interface for login, question management, active-set selection, and results.

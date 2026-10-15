# Hackathon Mentor AI Assistant

An AI-powered assistant designed to help hackathon teams turn a problem statement into a clear, time-bound plan for building and presenting a minimum viable product (MVP).

## Overview

Hackathons often have tight deadlines, and teams need to understand the problem, identify users, decide what to build first, divide the work, test the result, and prepare a convincing presentation.

Hackathon Mentor AI Assistant aims to bring these steps together in one place. A team provides its problem statement, team size, and available time; the application then helps organise the information into actionable outputs.

> **Project status:** Hackathon prototype in development. Features and setup instructions may change as modules are integrated and tested.

## Intended Features

- **Problem analysis:** Summarise the problem and identify potential users, user needs, and key features.
- **MVP planning:** Break the work into manageable tasks and suggest a practical technology stack and validation checkpoints.
- **Testing support:** Generate test cases to check expected behaviour and handle unclear or missing inputs.
- **Demo preparation:** Provide a demo checklist and a structured outline for presenting the solution to judges.
- **Time-aware planning:** Use the team size and time available to help keep the scope realistic.

AI-generated suggestions should be reviewed by the team before implementation or presentation.

## Tech Stack

The current planned stack is:

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Backend:** Node.js, Express.js
- **AI integration:** Gemini API (server-side)
- **Data storage:** No database is required for the initial prototype unless the implementation changes.

## Project Structure

```text
Hackathon_Mentor_AI_Assistant/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── backend/
│   ├── server.js
│   └── package.json
├── modules/
│   ├── mentor.js
│   ├── planner.js
│   └── demo.js
├── tests/
│   └── test-cases.json
├── .env.example
├── .gitignore
└── README.md
```

The structure describes the planned organisation; individual files and integrations may still be in progress.

## How It Is Intended to Work

1. The user enters a hackathon problem statement, team size, and time limit.
2. The backend validates the input and passes it to the relevant modules.
3. The mentor module analyses the problem and identifies users, needs, and features.
4. The planning module produces an MVP plan, suggested tech stack, tasks, and checkpoints.
5. The demo module provides test cases, a checklist, and a jury-presentation outline.
6. The frontend displays the results for the team to review.

The final flow depends on successful integration of all modules.

## Getting Started

### Prerequisites

- Node.js and npm installed
- Git installed
- A Gemini API key if Gemini integration is enabled

### 1. Clone the repository

```bash
git clone https://github.com/saketthakur06/Hackathon_Mentor_AI_Assistant.git
cd Hackathon_Mentor_AI_Assistant
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root, following `.env.example`.

For example:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Use the exact variable name expected by the backend implementation. Keep the real `.env` file private and never commit API keys to GitHub.

### 4. Start the server

Once the backend start script is configured in `backend/package.json`, run the command specified there. For example, if the script is named `start`:

```bash
npm start
```

Open the local URL printed by the server in your browser. The exact URL and run command depend on the current backend configuration.

## API

The planned backend endpoints are:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check whether the backend is running |
| `POST` | `/api/mentor` | Generate the mentor analysis, MVP plan, and demo preparation outputs |

Example request body for `POST /api/mentor`:

```json
{
  "problem_statement": "Describe the hackathon problem here",
  "team_size": 5,
  "time_limit_minutes": 90
}
```

The endpoint contract and response format should be confirmed against the integrated backend implementation.

## Testing

The `tests/test-cases.json` file contains test cases for the demo/testing module. Once all modules are connected, test the complete flow, including:

- A valid problem statement
- A different problem domain
- An empty or missing problem statement
- A vague or unclear problem statement
- Backend and AI-provider errors, if applicable

Module-level checks do not replace end-to-end testing of the complete application.

## Team Workflow

- Each team member should work on their own Git branch.
- Keep commits focused on the files assigned to you.
- Integrate branches into the team's agreed integration branch after review.
- Test the application end to end before presenting the final demo.
- Do not commit `.env`, API keys, or other secrets.

## Limitations

- Suggestions may be incomplete or incorrect and require human review.
- The quality of AI-generated results depends on the clarity of the problem statement and the availability of the AI service.
- Real-world performance and reliability must be evaluated through testing.
- Features described as planned should not be considered complete until they have been implemented and verified.

## Future Improvements

Potential improvements include better task allocation, more detailed time estimates, stronger validation, exportable plans, and improved handling of AI service failures.

## Contributors

Built collaboratively by the project team as a hackathon prototype.

---

**Hackathon Mentor AI Assistant** — helping teams move from a problem statement to a practical MVP plan.

![](https://komarev.com/ghpvc/?username=Rishi10898)

🧾 Project Title

Auckland Explorer - Context-Aware Decision System for Local Travel

🧩 Problem

Users often struggle to decide how to spend their free time due to:
- Too many options
- Fragmented information
- Lack of cost transparency

🎯 Goal

Reduce decision-making time by providing:
  1–3 optimized recommendations based on weather, budget, and location

🏗️ Solution

A web-based system that:

- Collects user input
- Integrates APIs
- Applies filtering logic
- Utilizes AI for the final decision

⚙️ Tech Stack

- Frontend: JavaScript, CSS, HTML
- Backend: Python
- APIs:
  - Google Maps
  - TomTom API
  - OpenWeather API
- AI:
  - NVIDIA API - DeepSeek v4 flash

🔄 System Flow

1. User input
2. Fetch weather and places
3. Filter options
4. Estimate cost
5. AI selects the best option

📊 Key Features

- Context-aware recommendations
- Cost breakdown
- Reduced decision fatigue

⚠️ Challenges

- API complexity
- AI reliability
- Time constraints

📈 Impact

- Faster decision-making
- Increased local exploration
- Support for sustainable travel

🔍 Reflection

- Trade-offs between accuracy and simplicity
- Importance of structured data for AI
- Valuable real-world system design experience

## GitHub Pages deployment

GitHub Pages serves the static files in `frontend/`; the FastAPI backend is not
run by Pages. The included [`render.yaml`](./render.yaml) configures the API as
a Render web service. In Render, create a Blueprint from this repository and
provide `NVIDIA_API_KEY`, `OPEN_WEATHER_API_KEY`, and `TOMTOM_API_KEY` when
prompted. After deployment, the frontend uses
`https://auckland-explorer-ai-agent-api.onrender.com/api/chat`. The local
backend URL is used when the site is opened on `localhost` or `127.0.0.1`.

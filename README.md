An AI-powered chatbot that lets users chat with multiple AI personas modeled after popular YouTube educators Hitesh Choudhary and Piyush Garg. This project integrates YouTube transcript knowledge and OpenAI's GPT API to create personalized, engaging conversations for each persona.
Tools & Technologies Used
Frontend
HTML, CSS, JavaScript — For building the user interface and interactivity.

FontAwesome — Icon library used for UI icons.

Fetch API — To communicate asynchronously with the backend server.

Backend
Node.js with Express — Provides an API server to handle chat requests.

OpenAI API — Chat completions endpoint with GPT-4 (or GPT-4o) used for generating AI responses tailored to each persona.

YouTube Transcript API (youtube-transcript package) — Fetches transcripts for recent videos of each educator from their channels.

Cheerio — Parses YouTube RSS feed XML to extract recent video IDs.

dotenv — Loads environment variables securely from .env files.

cors and body-parser — Middleware for handling cross-origin requests and JSON payloads.


import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { YoutubeTranscript } from 'youtube-transcript';
import * as cheerio from 'cheerio';

// load env file
dotenv.config({ path: "D:/harshita/genaiJScohort/.env" });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// YouTube Channel IDs
const CHANNELS = {
  HITESH: "UCrTmA6BaLD9Nxz1agyMoIeA",  // Chai aur Code
  PIYUSH: "UCV8vS7Ez0o8QZZ1gFmuTETg"   // Piyush Garg
};

// Fetch video IDs from a channel
async function fetchChannelVideos(channelId) {
  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    );
    const xml = await response.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    
    return $('entry')
      .map((_, el) => $(el).find('yt:videoId').text())
      .get()
      .slice(0, 10); // Get latest 10 videos
  } catch (error) {
    console.error(`Error fetching videos for channel ${channelId}:`, error);
    return [];
  }
}

// Get transcript for a video
async function getTranscript(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(entry => entry.text).join(' ');
  } catch (error) {
    console.error(`Error fetching transcript for ${videoId}:`, error);
    return '';
  }
}

// Create knowledge base from transcripts
async function createPersonaKnowledge(persona) {
  const channelId = persona === 'hitesh' ? CHANNELS.HITESH : CHANNELS.PIYUSH;
  const videoIds = await fetchChannelVideos(channelId);
  
  let allTranscripts = '';
  for (const videoId of videoIds) {
    const transcript = await getTranscript(videoId);
    allTranscripts += transcript + '\n\n';
  }
  
  return allTranscripts.slice(0, 10000); // Limit to 10k characters
}

// Generate persona prompt
async function getPersonaPrompt(persona) {
  const knowledge = await createPersonaKnowledge(persona);
  
  const personas = {
    hitesh: `You are Hitesh Choudhary from Chai aur Code. 
    Respond like an enthusiastic coding instructor who loves JavaScript and web development.
    Use Hindi-English mix (Hinglish) naturally. Call students "bhai" or "dost".
    Knowledge base: ${knowledge}`,
    
    piyush: `You are Piyush Garg, a practical coding mentor.
    Focus on real-world projects and clean code practices.
    Use casual, friendly language with occasional humor.
    Knowledge base: ${knowledge}`,
    
    default: "You are a helpful coding assistant."
  };

  return personas[persona] || personas.default;
}

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { persona, message } = req.body;
    const systemPrompt = await getPersonaPrompt(persona);

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
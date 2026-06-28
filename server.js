import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Copy the uploaded icon image to public directory
const srcPath = 'C:/Users/KIIT/.gemini/antigravity-ide/brain/0837e7e3-7d62-442f-b30e-c1056b90ae69/media__1782631728366.png';
const destLogo = './public/logo.png';
const destFavicon = './public/favicon.png';

try {
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destLogo);
    fs.copyFileSync(srcPath, destFavicon);
    console.log('Successfully copied logo and favicon in server!');
  } else {
    console.log('Source image not found in server at ' + srcPath);
  }
} catch (e) {
  console.error('Failed to copy files in server:', e);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Resume Parsing Endpoint
app.post('/api/parse-resume', async (req, res) => {
  try {
    const { fileText, filename } = req.body;
    
    if (!fileText && !filename) {
      return res.status(400).json({ error: "Missing fileText or filename in request body." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }

    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const prompt = `Parse the following resume text into a structured JSON profile. Extracted fields should match this schema: {
  name: string,
  role: string,
  skills: string[],
  experience: { company: string, title: string, period: string }[],
  education: { school: string, degree: string, period: string, grade: string }[],
  projects: { title: string, tool: string, description: string }[],
  email: string,
  phone: string,
  score: number (match score from 0-100 indicating relevance to a software/tech role),
  summary: string (brief AI executive summary)
}

Resume text:
${fileText || filename}`;

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              role: { type: "STRING" },
              skills: { type: "ARRAY", items: { type: "STRING" } },
              experience: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    company: { type: "STRING" },
                    title: { type: "STRING" },
                    period: { type: "STRING" }
                  },
                  required: ["company", "title", "period"]
                }
              },
              education: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    school: { type: "STRING" },
                    degree: { type: "STRING" },
                    period: { type: "STRING" },
                    grade: { type: "STRING" }
                  },
                  required: ["school", "degree", "period"]
                }
              },
              projects: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    tool: { type: "STRING" },
                    description: { type: "STRING" }
                  },
                  required: ["title", "tool", "description"]
                }
              },
              email: { type: "STRING" },
              phone: { type: "STRING" },
              score: { type: "INTEGER" },
              summary: { type: "STRING" }
            },
            required: ["name", "role", "skills", "experience", "education", "projects", "email", "phone", "score", "summary"]
          }
        }
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Gemini API call failed with status ${apiResponse.status}: ${errorText}`);
    }

    const data = await apiResponse.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    const parsedCandidate = JSON.parse(textResponse);

    res.json(parsedCandidate);
  } catch (error) {
    console.error("Backend parser failed:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Server Status endpoint to verify API key presence
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    apiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Serve static files from the React frontend build directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));

// Wildcard route to serve index.html for client-side routing
app.get('*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

export default app;

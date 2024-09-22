import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  jwt.verify(token, process.env.AUTH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

router.get('/user', authenticateToken, (req, res) => {
  res.json(req.user.user);
});

router.get('/generate-tweets', authenticateToken, async (req, res) => {
  try {
    const { prompt } = req.query;
    console.log("Prompt: ", prompt);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const tweetType = 'casual';
    const aiPrompt = `Write me 5 tweets about ${prompt} in JSON format with id, tweet. A ${tweetType} tweet with some hashtags. End the tweet with our own tag #TweetWizAI.`;

    const result = await model.generateContent(aiPrompt);
    const generatedContent = result.response.text();
    console.log("GeneratedContent: ",generatedContent);
    

    const cleanedContent = generatedContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const jsonResponse = JSON.parse(cleanedContent);
    res.json(jsonResponse);
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

export const apiRoutes = router;
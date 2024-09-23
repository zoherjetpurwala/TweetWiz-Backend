import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Not authenticated' });
};

router.get('/user', ensureAuthenticated, (req, res) => {
  const userData = {
    id: req.user.id,
    name: req.user.name,
    username: req.user.username,
    image: req.user.image,
  };
  res.json(userData);
});

router.get('/generate-tweets', ensureAuthenticated, async (req, res) => {
  try {
    const { prompt } = req.query;
    console.log("Prompt: ", prompt);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const aiPrompt = `Write me 5 tweets about ${prompt} in JSON format with id, tweet. A casual tweet with some hashtags. End the tweet with our own tag #TweetWizAI.`;

    const result = await model.generateContent(aiPrompt);
    const generatedContent = result.response.text(); // Make sure this is the correct method to extract text

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

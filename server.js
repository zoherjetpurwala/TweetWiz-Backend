import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { configurePassport } from './src/config/passport.js';
import { authRoutes } from './src/routes/auth.js';
import { apiRoutes } from './src/routes/api.js';
import { errorHandler } from './src/utils/errorHandler.js';
import { sessionMiddleware } from './src/utils/redisUtils.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET is not set in the environment variables');
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(sessionMiddleware);


app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport
configurePassport(passport);

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
import { Strategy as TwitterStrategy } from '@superfaceai/passport-twitter-oauth2';
import jwt from 'jsonwebtoken';

export const configurePassport = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(new TwitterStrategy({
    clientID: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    clientType: 'confidential',
    callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
    includeEmail: true,
    passReqToCallback: true,
    state: true
  }, 
  async (req, accessToken, refreshToken, profile, done) => {
    console.log('Twitter authentication attempt', { accessToken, refreshToken, profile });
    
    if (!profile) {
      console.error('Twitter authentication failed: No profile returned');
      return done(null, false, { message: 'Twitter authentication failed' });
    }

    try {
      const user = {
        id: profile.id,
        name: profile.displayName,
        username: profile.username,
        image: profile.photos[0].value,
        accessToken,
        refreshToken
      };

      req.session.state = req.query.state;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      return done(null, user);
    } catch (error) {
      console.error('Error in Twitter strategy verify function:', error);
      return done(error);
    }
  }));
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
      },
    },
    process.env.AUTH_SECRET,
    { expiresIn: '1h' }
  );
};
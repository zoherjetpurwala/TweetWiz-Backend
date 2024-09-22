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
  (req, accessToken, refreshToken, profile, done) => {
    console.log('Twitter authentication attempt', { accessToken, refreshToken, profile });
    
    if (!profile) {
      console.error('Twitter authentication failed: No profile returned');
      return done(null, false, { message: 'Twitter authentication failed' });
    }
    
    return done(null, profile);
  }));
};

export const generateToken = (user) => {
  const { id, name, profile_image_url, username } = user._json;
  return jwt.sign(
    {
      user: {
        id,
        name,
        username,
        image: profile_image_url,
      },
    },
    process.env.AUTH_SECRET,
    { expiresIn: '1h' }
  );
};

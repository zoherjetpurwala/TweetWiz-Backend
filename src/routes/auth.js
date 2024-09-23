import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/twitter', (req, res, next) => {
  console.log('Initiating Twitter authentication');
  passport.authenticate('twitter', {
    scope: ['tweet.read', 'users.read', 'offline.access'],
    state: true, // Using state for security
  })(req, res, next);
});

router.get('/twitter/callback', (req, res, next) => {
  passport.authenticate('twitter', (err, user, info) => {
    if (err) {
      console.error('Twitter authentication error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/auth-error?error=${encodeURIComponent(err.message)}`);
    }
    if (!user) {
      console.error('Twitter authentication failed:', info.message);
      return res.redirect(`${process.env.FRONTEND_URL}/auth-error?error=${encodeURIComponent(info.message)}`);
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('Error logging in user:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/auth-error?error=${encodeURIComponent(err.message)}`);
      }
      return res.redirect(`${process.env.FRONTEND_URL}`);
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  console.log('Logout request received');
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.clearCookie('connect.sid');
    console.log('User logged out successfully');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
});

export const authRoutes = router;

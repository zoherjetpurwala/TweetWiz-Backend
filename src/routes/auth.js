import express from "express";
import passport from "passport";
import { generateToken } from "../config/passport.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.get("/twitter", (req, res, next) => {
  const state = uuidv4();
  req.session.state = state;
  req.session.save((err) => {
    if (err) {
      console.error('Error saving session:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/auth-error?error=Session%20Save%20Error`);
    }
    console.log("Initiating Twitter authentication with state:", state);
    console.log("Session ID:", req.sessionID);
    passport.authenticate("twitter", {
      scope: ["tweet.read", "users.read", "offline.access"],
      state: state,
    })(req, res, next);
  });
});

router.get("/twitter/callback", (req, res, next) => {
  console.log('Twitter callback received');
  console.log('Session ID:', req.sessionID);
  console.log('Entire session object:', req.session);
  console.log('State in session:', req.session.state);
  console.log('State returned from Twitter:', req.query.state);

  if (!req.session.state) {
    console.error('Session state is undefined');
    return res.redirect(`${process.env.FRONTEND_URL}/auth-error?error=Session%20State%20Missing`);
  }

  if (req.session.state !== req.query.state) {
    console.error('State mismatch error.');
    return res.redirect(`${process.env.FRONTEND_URL}/auth-error?error=State%20mismatch`);
  }

  passport.authenticate("twitter", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Twitter authentication error:", err);
      if (err.oauthError && err.oauthError.statusCode === 429) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth-error?error=Too Many Requests. Please try again later.`
        );
      }
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth-error?error=${encodeURIComponent(
          err.message
        )}`
      );
    }
    if (!user) {
      console.error("Twitter authentication failed:", info.message);
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth-error?error=${encodeURIComponent(
          info.message
        )}`
      );
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error logging in user:", err);
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth-error?error=${encodeURIComponent(
            err.message
          )}`
        );
      }
      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 3600000,
      });
      return res.redirect(process.env.FRONTEND_URL);
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });
    res.json({ message: "Logged out successfully" });
  });
});

export const authRoutes = router;

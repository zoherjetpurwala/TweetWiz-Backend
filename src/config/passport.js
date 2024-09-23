import { Strategy as TwitterStrategy } from "@superfaceai/passport-twitter-oauth2";

export const configurePassport = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(
    new TwitterStrategy(
      {
        clientID: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        clientType: "confidential",
        callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
        includeEmail: true,
        passReqToCallback: true,
        state: true,
      },
      (req, accessToken, refreshToken, profile, done) => {
        console.log("Twitter authentication attempt", {
          accessToken,
          refreshToken,
          profile,
        });

        if (!profile) {
          console.error("Twitter authentication failed: No profile returned");
          return done(null, false, {
            message: "Twitter authentication failed",
          });
        }

        const userData = {
          id: profile._json.id,
          name: profile._json.name,
          username: profile._json.username,
          image: profile._json.profile_image_url,
        };
        console.log(userData);
        return done(null, userData);
      }
    )
  );
};

import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'
dotenv.config()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, {
        googleId: profile._json.sub || null,
        fullName: profile._json.family_name + ' ' + profile._json.given_name || null,
        gmail: profile._json.email || null,
        image: profile._json.picture || null
      })
    }
  )
)

export default passport

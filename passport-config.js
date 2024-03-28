// app.js or passport-config.js

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user"); // Your User model
const bcrypt = require("bcryptjs")



module.exports = function configurePassport() {
    passport.use(new LocalStrategy(
        async function(username, password, done) {
            try {
                // Find user by username (email) in the database
                const user = await User.findOne({ email: username });
                
                if (!user) {
                    // User not found
                    console.log("Incorrect username")
                    return done(null, false);
                }

                // Compare passwords using bcrypt
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    console.log("Incorrect PW")
                    // Password doesn't match
                    return done(null, false);
                }

                // Authentication successful, return user
                return done(null, user);
            } catch (err) {
                // Error during authentication
                return done(err);
            }
        }
    ));

    // Serialize user to store in session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};
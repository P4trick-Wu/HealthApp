const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const crypto = require('crypto');

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (email, password, done) => {
    console.log(email, password);
    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        // checks if there are users
        if (results.rows.length > 0) {
          const user = results.rows[0];

          //Checks if user is a trainer, turn string into sha256 and compare with database password

          const hashedPass = hash(password);

          if(user.usertype === 'trainer' || user.usertype === 'admin') {
            console.log(hashedPass)
            if(hashedPass == user.password) {
              return done(null, user);
            }
          }

          // Compares encrypted password stored in data base with user entered password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.log(err);
            }
            // return user and store in session cookie if passwords match
            if (isMatch) {
              return done(null, user);
            } else {
              //password is incorrect
              return done(null, false, { message: "Password is incorrect" });
            }
          });
        } else {
          // No user
          return done(null, false, {
            message: "No user with that email address"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );
  // Stores user details inside session. serializeUser determines which data of the user
  // object should be stored in the session. The result of the serializeUser method is attached
  // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
  //   the user id as the key) req.session.passport.user = {id: 'xyz'}
  passport.serializeUser((user, done) => done(null, user.id));

  // In deserializeUser that key is matched with the in memory array / database or any data resource.
  // The fetched object is attached to the request object as req.user

  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`ID is ${results.rows[0].id}`);
      return done(null, results.rows[0]);
    });
  });
}

// Use this function to compare and generate hashed passwords for admin and trainers
function hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

module.exports = initialize;

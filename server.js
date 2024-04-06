const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
require("dotenv").config();
const app = express();

const PORT = process.env.PORT || 3000;

const initializePassport = require("./passportConfig");

initializePassport(passport);

// Middleware

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
// Serve static files from public folder
app.use(express.static("public"));
// Parse json bodies
app.use(express.json())


app.set("view engine", "ejs");

app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false
  })
);
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/login", checkAuthenticated, (req, res) => {
  // flash sets a messages variable. passport sets the error message
  console.log(req.session.flash.error);
  res.render("login.ejs");
});

app.get("/dashboard", checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated());
  // Sends id, user's name, saved stepcount and stepgoal to client dashboard page
  res.render("dashboard", 
  { user: req.user.name,
    stepcount: req.user.stepcount,
    stepgoal: req.user.stepgoal,
    id: req.user.id
  });
  
});

app.get("/logout", (req, res) => {
  // req.logout();
  // res.render("index", { message: "You have logged out successfully" });

  // updated for passport version 0.6.0 since it is asynchornous
   req.logOut(function(err) {
        if (err) { return next(err); }
        req.flash("success_msg", "You have successfully logged out.");
        res.redirect("/login");
    });

});

app.post("/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;

  let errors = [];

  console.log({
    name,
    email,
    password,
    password2
  });

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // Validation passed
    pool.query(
      `SELECT * FROM users
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          return res.render("register", {
            message: "Email already registered"
          });
        } else {
          // INserts user details into databbase
          pool.query(
            `INSERT INTO users (name, email, password, usertype)
                VALUES ($1, $2, $3, $4)
                RETURNING id, password`,
            [name, email, hashedPassword, "member"],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              req.flash("success_msg", "You are now registered. Please log in");
              res.redirect("/login");
            }
          );
        }
      }
    );
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
  })
);

// other post functions


app.post("/submit-steps-data", (req, res) => {

  const { id, stepCount, stepGoal } = req.body;

  console.log(req.body)

  // Log the received data
  console.log("Received data:", stepCount, stepGoal, id);

  // Send a response back to the client
  res.status(200).send("Data received successfully");

  
  if(stepCount.length > 0) {
    console.log(stepCount.length)
    console.log(user.id)
    // pool.query(
    //   `UPDATE users
    //   SET stepcount = $1
    //   WHERE id = $2`,
    //   [req.body.stepCount, req.body.id],
    //   (err, results) => {
    //     if (err) {
    //       console.log(err);
    //     }
    //     console.log(results.rows);

    //   }
    // );
  }
  if(req.body.stepGoal > 0) {
    // pool.query(
    //   `UPDATE users
    //   SET stepgoal = $1
    //   WHERE id = $2`,
    //   [req.body.stepGoal, req.body.id],
    //   (err, results) => {
    //     if (err) {
    //       console.log(err);
    //     }
    //     console.log(results.rows);

    //   }
    // );
  }

  // Update daily steps and goals columsn in database (users table)


});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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

app.get("/memdashboard", checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated());

  //gets a list of your classes

  // Sends id, user's name, saved stepcount and stepgoal to client memdashboard page
  res.render("memdashboard", 
  { user: req.user.name,
    stepcount: req.user.stepcount,
    stepgoal: req.user.stepgoal,
    id: req.user.id
  });
  
});

app.get("/trainerdashboard", checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated());


  let userList = [];
  // Gets list of all users
  pool.query(
      `SELECT * FROM users WHERE usertype = 'member' ORDER by name ASC`,
      (err, results) => {
        if (err) {
          console.log(err);
        }

        // Puts corresponding name and email of members from results into a list
        userList = results.rows.map(user => ({
          name: user.name,
          email: user.email
        }));

         // Sends data to trainerdashboard page
        res.render("trainerdashboard", 
          { user: req.user.name,
            stepcount: req.user.stepcount,
            stepgoal: req.user.stepgoal,
            id: req.user.id,

            // Send list of members to dashboard
            members: userList
        });

        // console.log(userList)
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

// Handles login request from client
app.post(
  "/login",
  passport.authenticate("local", {
    // successRedirect: "/trainerdashboard",
    failureRedirect: "/login",
    failureFlash: true
  }),
  // Directs member to member dash and trainer to trainer dash
  (req, res) => {

    if (req.user.usertype === 'trainer') {
      res.redirect("/trainerdashboard");
    } else {
      res.redirect("/memdashboard");
    }
  }
);

//trainer dashboard post requests


// Returns availalbe rooms from the database
app.post("/find-rooms", (req, res) => {

    // Gets list of all availalbe rooms (maybe check for capacity and time conflicts or let admin do that lol)
    pool.query(
      `SELECT * FROM rooms
        `,
      (err, results) => {
        if (err) {
          console.log(err);
        }

        // Puts corresponding room info in rooms object
        const rooms = results.rows.map(room => ({
          id: room.roomid,
          name: room.roomname,
          capacity: room.capacity
      
        }));

        // sends data back to client
        res.json({ data: rooms });

      }); 
});

// Returns trainer's own sessions
app.post("/view-schedules", (req, res) => {

    // Gets list of all users with matching mame
    pool.query(
      `SELECT * FROM schedules
        WHERE trainerid = $1`,
      [req.user.id]
      ,
      (err, results) => {
        if (err) {
          console.log(err);
        }

        // Puts corresponding session title, cost, times and num users back to client
        const schedule = results.rows.map(user => ({
          title: user.title,
          cost: user.cost,
          date: user.seshdate,
          start: user.starttime,
          seshid: user.scheduleid,
          room: user.room,
          turnout: user.turnout

      
        }));

        // sends data back to client
        res.json({ data: schedule });

      }); 
});

// Deletes trainer's schedule from database
app.post("/delete-session", (req, res) => {

  const data = req.body;

  // Deletes rows in signup table with sessionid
  pool.query(
    `DELETE FROM signup
      WHERE scheduleid = $1`,
    [data.id]
    ,
    (err, results) => {
      if (err) {
        console.log(err);
      }
      // Finds and deletes row in schedules table with the same session id
      pool.query(
        `DELETE FROM schedules
          WHERE scheduleid = $1`,
        [data.id]
        ,
        (err, results) => {
          if (err) {
            console.log(err);
          }       
        }); 
    }); 
});

// upload new schedule into database 
app.post("/new-schedule-data", (req, res) => {

  const title = req.body.newTitle;
  const dateTime = req.body.newDateTime;
  const endTime = req.body.newEndTime;
  const cost = req.body.newCost;
  const id = req.user.id

  const roomId = req.body.newRoom;
  const capacity = req.body.newCapacity;

  console.log(req.body)

  // parse datetime-local string into date and time compnents
  const datetime = new Date(dateTime);

  // Date components
  const year = datetime.getFullYear();
  const month = datetime.getMonth() + 1; 
  const day = datetime.getDate();

  // time components
  const hours = datetime.getHours();
  const minutes = datetime.getMinutes();

  // time for end time
  const [endHours, endMinutes] = endTime.split(":");

  // construct AQL date and time
  const sqlDate = `${year}-${month}-${day}`;
  const sqlStartTime = `${hours}:${minutes}`;
  const sqlEndTime = `${endHours}:${endMinutes}`;


  // queries values into database, creating a new schedule 
  pool.query(
    `INSERT INTO schedules (cost, seshdate, starttime, endtime, trainerid, title, room, capacity)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [cost, sqlDate, sqlStartTime, sqlEndTime, id, title, roomId, capacity ],
    (err, results) => {
      if (err) {
        res.status(404).send("Error uplodaing to database");
        throw err;
      }
        //Send response back to client
        res.status(200).send("Data received successfully");
    }
  );

});

// Finds users that match name entered from client, sends matching users back to client
app.post("/find-members", (req, res) => {

    const name = req.body.name;

    // Gets list of all users with matching mame
    pool.query(
      `SELECT * FROM users
        WHERE name LIKE '%' || $1 || '%' AND usertype = 'member' ORDER by name ASC`,
      [name]
      ,
      (err, results) => {
        if (err) {
          console.log(err);
        }

        // Puts corresponding name and email of members from results into a list
        const userList = results.rows.map(user => ({
          name: user.name,
          email: user.email,
          id: user.id
        }));

        // console.log(userList)
        // sends data back to client
        res.json({ members: userList });

      }); 
});



// member dashboard post requests

// Deletes user signed up session from signup table, decrement corresponding schedule turnout by one
app.post("/delete-user-event", (req, res) => {

  const data = req.body;

  // Deletes row in signup table with sessionid and userid that user signed up for
  pool.query(
    `DELETE FROM signup
      WHERE scheduleid = $1 AND userid = $2`,
    [data.id, req.user.id]
    ,
    (err, results) => {
      if (err) {
        console.log(err);
      }
      // decrements turnout in corresponding schedule in schedules table
      pool.query(
        `UPDATE schedules SET turnout = turnout - 1
          WHERE scheduleid = $1`,
        [data.id]
        ,
        (err, results) => {
          if (err) {
            console.log(err);
          }       
        }); 
    }); 
});

// Signs user up for session, increments schedule turnout by 1
app.post("/sign-up", (req, res) => {

  const userId = req.user.id;
  console.log(userId)

    // insert schedule id and user id into signup table, then increment turnout in schedules
    pool.query(
      `INSERT INTO signup (scheduleid, userid)
       VALUES ($1, $2)`,
      [req.body.scheduleId, userId]
       ,
      (err, results) => {
        if (err) {
          console.log(err);
        }

        // Increment turnout in shcedules for schedule id
        pool.query(
          `UPDATE schedules SET turnout = turnout + 1 WHERE scheduleid = $1
            `,
          [req.body.scheduleId]
          ,
          (err, results) => {
            if (err) {
              console.log(err);
            }

          }); 


      }); 
});

// Find events the user has signed up for
app.post("/find-your-events", (req, res) => {

    // Finds schedules where capacity > turnout and userid = scheduleid in signup, finding schedules user has signed up for
    pool.query(
      `SELECT s.*
        FROM schedules s
        LEFT JOIN signup su ON s.scheduleid = su.scheduleid 
        WHERE s.capacity > s.turnout AND su.userid = $1`,
        [req.user.id],
      (err, results) => {
        if (err) {
          console.log(err);
        }

        // Puts corresponding session title, cost, times and num users back to client
        const schedule = results.rows.map(session => ({
          title: session.title,
          cost: session.cost,
          date: session.seshdate,
          start: session.starttime,
          seshid: session.scheduleid,
          room: session.room,
          turnout: session.turnout
      
        }));

        // sends data back to client
        res.json({ data: schedule });

      }); 
});

// Find events that user has not signed up for, return to client
app.post("/find-events", (req, res) => {

    // Finds schedules where capacity > turnout and userid != scheduleid in signup, finding schedules user has not signed up for
    pool.query(
      `SELECT s.*
        FROM schedules s
        LEFT JOIN signup su ON s.scheduleid = su.scheduleid AND su.userid = $1
        WHERE s.capacity > s.turnout AND su.userid IS NULL`,
        [req.user.id],
      (err, results) => {
        if (err) {
          console.log(err);
        }

        // Puts corresponding session title, cost, times and num users back to client
        const schedule = results.rows.map(session => ({
          title: session.title,
          cost: session.cost,
          date: session.seshdate,
          start: session.starttime,
          seshid: session.scheduleid,
          room: session.room,
          turnout: session.turnout
      
        }));

        // sends data back to client
        res.json({ data: schedule });

      }); 
});

// update user current daily steps and step goals
app.post("/submit-steps-data", (req, res) => {

  const { stepCount, stepGoal } = req.body;
  const id = req.user.id

  // console.log(req.body)

  // Log the received data
  console.log("Received data:", stepCount, stepGoal, " for user ", id);

  // Send a response back to the client
  res.status(200).send("Data received successfully");

  // Update steps database values for user in users table, only updates if user entered a value in the textbox
  if(stepCount.length > 0) {
    
    // Queries values 
    pool.query(
      `UPDATE users
      SET stepcount = $1
      WHERE id = $2`,
      [stepCount, id],
      (err, results) => {
        if (err) {
          console.log(err);
        }
      }
    );
  }
  if(stepGoal.length > 0) {
    
    pool.query(
      `UPDATE users
      SET stepgoal = $1
      WHERE id = $2`,
      [stepGoal, id],
      (err, results) => {
        if (err) {
          console.log(err);
        }
      }
    );
  }


});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // check user type, redirect to correct dash if already logged in on client
    if(req.user.usertype == 'member') {
      return res.redirect("/memdashboard");
    } else {
      return res.redirect("/trainerdashboard");
    }
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

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

app.get("/admindashboard", checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated());

  //gets a list of your classes

  // Sends id, user's name, saved stepcount and stepgoal to client memdashboard page
  res.render("admindashboard", 
  { user: req.user.name,
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
            // stepcount: req.user.stepcount,
            // stepgoal: req.user.stepgoal,
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
              // insert corresponding user into stats table
              pool.query(
                `INSERT INTO stats (email) VALUES ($1)`,
                [email],
                (err, results) => {
                  if (err) {
                    throw err;
                  }
      
                  console.log(results.rows);
                  req.flash("success_msg", "You are now registered. Please log in");
                  res.redirect("/login");
                }
              );

              // console.log(results.rows);
              // req.flash("success_msg", "You are now registered. Please log in");
              // res.redirect("/login");
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
  
  (req, res) => {
    // Directs members to appropriate dashboard
    if (req.user.usertype === 'trainer') {
      res.redirect("/trainerdashboard");
    } else if (req.user.usertype === 'admin'){
      res.redirect("/admindashboard")
    } else {
      res.redirect("/memdashboard");
    }
  }
);

// Admin dashboard post requests

// insert a new equipment into the database
app.post("/create-equipment", (req, res) => {

    const data = req.body;
    
    // Inserts name and capacity into rooms table
    pool.query(
      `INSERT INTO equipment (roomid, equipmentname) VALUES (NULL, $1)
        `, [data.name],
      (err, results) => {
        if (err) {
          console.log(err);
        }

      }); 
});

// return all equipment to admin
app.post("/find-equipment-admin", (req, res) => {

    // Finds all schedule sessions, adding a new column of the names of trainers who created the session based on their trainerid
    pool.query(
      `SELECT * from equipment
    `,
      (err, results) => {
        if (err) {
          console.log(err);
        }

        // console.log(results.rows)

        // Puts corresponding session title, cost, times and num users back to client
        const equipment = results.rows.map(item => ({
          roomid: item.roomid,
          name: item.equipmentname,
          durability: item.durability,
          durabilityRemaining: item.remaining,
          equipId: item.equipid
      
        }));

        // sends data back to client
        res.json({ data: equipment });

      }); 
});

// delete equipment from database
app.post("/delete-equipment", (req, res) => {

    const data = req.body;
   
    // deletes equipment with id equivalent to value passed in from equipment table
    pool.query(
      `DELETE FROM equipment WHERE equipid = $1
        `, [data.equipid],
      (err, results) => {
        if (err) {
          console.log(err);
        }

      }); 
});

// updates equipment data in database
app.post("/update-equipment", (req, res) => {

  const name = req.body.name;
  const durability = req.body.durability;
  const room = req.body.room;
  const equipid = req.body.equipid;

  // queries values into database, creating a new schedule 
  pool.query(
    `UPDATE equipment
    SET equipmentname = $1, remaining = $2, roomid = $3 
    WHERE equipid = $4`,
    [name, durability, room, equipid],
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



// Inserts new room into database in rooms table
app.post("/create-new-room", (req, res) => {

    const data = req.body;
    
    // Inserts name and capacity into rooms table
    pool.query(
      `INSERT INTO rooms (roomname, capacity) VALUES ($1, $2)
        `, [data.name, data.capacity],
      (err, results) => {
        if (err) {
          console.log(err);
        }

      }); 
});

// deletes room from database in rooms table
app.post("/delete-room", (req, res) => {

    const data = req.body;

    // Updates the roomid of all equipment in the room to null
    pool.query(
      `UPDATE equipment SET roomid = NULL WHERE roomid = $1
        `, [data.roomId],
      (err, results) => {
        if (err) {
          console.log(err);
        }

        // deletes room from room table based on roomId passed in from client
        pool.query(
          `DELETE FROM rooms WHERE roomid = $1
            `, [data.roomId],
          (err, results) => {
            if (err) {
              console.log(err);
            }

          }); 

      }); 
    
    // // deletes room from room table based on roomId passed in from client
    // pool.query(
    //   `DELETE FROM rooms WHERE roomid = $1
    //     `, [data.roomId],
    //   (err, results) => {
    //     if (err) {
    //       console.log(err);
    //     }

    //   }); 
});

// Returns all sessions to admin
app.post("/find-events-admin", (req, res) => {

    // Finds all schedule sessions, adding a new column of the names of trainers who created the session based on their trainerid
    pool.query(
      `SELECT users.name AS name, schedules.*
        FROM schedules
        INNER JOIN users ON schedules.trainerid = users.id;
    `,
      (err, results) => {
        if (err) {
          console.log(err);
        }

        // console.log(results.rows)

        // Puts corresponding session title, cost, times and num users back to client
        const schedule = results.rows.map(session => ({
          title: session.title,
          // cost: session.cost,
          date: session.seshdate,
          start: session.starttime,
          seshid: session.scheduleid,
          room: session.room,
          turnout: session.turnout,
          capacity: session.capacity,
          trainer: session.name
      
        }));

        // sends data back to client
        res.json({ data: schedule });

      }); 
});

// Updates session with given data
app.post("/new-schedule-data", (req, res) => {

  const title = req.body.newTitle;
  const dateTime = req.body.newDateTime;
  const endTime = req.body.newEndTime;

  // console.log(req.body)

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
    `UPDATE schedules
    SET title = $1, seshdate = $2, starttime = $3, endtime = $4
    WHERE scheduleid = $5`,
    [title, sqlDate, sqlStartTime, sqlEndTime, req.body.sessionId],
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
          // cost: user.cost,
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
  // const cost = req.body.newCost;
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
    `INSERT INTO schedules (seshdate, starttime, endtime, trainerid, title, room, capacity)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [sqlDate, sqlStartTime, sqlEndTime, id, title, roomId, capacity ],
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
      `SELECT users.*, stats.*
        FROM users
        JOIN stats ON users.email = stats.email
        WHERE users.name LIKE '%' || $1 || '%' AND users.usertype = 'member'
        ORDER BY users.name ASC`,
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
          id: user.id,
          paidfor: user.paidfor
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

        // Puts corresponding session title, times and num users back to client
        const schedule = results.rows.map(session => ({
          title: session.title,
          // cost: session.cost,
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
          // cost: session.cost,
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
    } else if (req.user.usertype === 'admin') {
      return res.redirect("/admindashboard")
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

-- select * from users

-- Creating basic users table
CREATE TABLE users (

	id BIGSERIAL PRIMARY KEY NOT NULL,
	name VARCHAR(200) NOT NULL,
	email VARCHAR(200) NOT NULL,
	password VARCHAR(200) NOT NULL,
	usertype VARCHAR(15) NOT NULL,
	UNIQUE (email)

);

-- user stats table
CREATE TABLE stats (

	email VARCHAR(200) REFERENCES users(email),
	paidfor BOOLEAN DEFAULT FALSE,
	heartrate INTEGER DEFAULT 80,
	hearrategoal INTEGER DEFAULT 60,
	weight INTEGER 
	weightgoal INTEGER
);


-- create schedules table
CREATE TABLE schedules (

	scheduleId SERIAL PRIMARY KEY,
	seshDate DATE NOT NULL,
	startTime TIME NOT NULL,
	endTime TIME NOT NULL,
	trainerId INTEGER REFERENCES users(id),
	title VARCHAR(300) NOT NULL,
	capacity INTEGER DEFAULT 1,
	turnout INTEGER DEFAULT 0,
	--room VARCHAR(100) NOT NULL
	room  INTEGER NOT NULL

);

-- Creating signup table
CREATE TABLE signup (
	
	scheduleid INTEGER REFERENCES schedules(scheduleId),
	userid INTEGER REFERENCES users(id)

);

-- Creating rooms table
CREATE TABLE rooms (

	roomId SERIAL PRIMARY KEY,
	roomName VARCHAR(100) NOT NULL,
	capacity INTEGER DEFAULT 5
);

-- Create equipment table
CREATE TABLE equipment (
	equipId SERIAL PRIMARY KEY,
	roomId INTEGER REFERENCES rooms(roomId),
	equipmentName VARCHAR(100) NOT NULL,
	durability INTEGER DEFAULT 1000,
	remaining INTEGER DEFAULT 1000	
);


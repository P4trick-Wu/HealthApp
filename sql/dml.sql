-- select * from users

INSERT INTO users (name, email, password, usertype)
	VALUES ('TestTrainer', 'trainer@gmail.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'trainer');
-- password is 123456

INSERT INTO users (name, email, password, usertype)
	VALUES ('TestTrainer2', 't2@gmail.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'trainer');

INSERT INTO users (name, email, password, usertype)
	VALUES ('admin', 'admin@gmail.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'admin');	
-- password for both admin and TestTrainer2 is "password"

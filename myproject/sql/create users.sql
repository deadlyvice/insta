create table users (

	id SERIAL PRIMARY KEY,
	name CHAR(40) NOT NULL,
	email CHAR(120) UNIQUE NOT NULL,
	nickname CHAR(40) NOT NULL,
	password CHAR (40) NOT NULL
);


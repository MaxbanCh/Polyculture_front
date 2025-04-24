DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS Themes;
DROP TABLE IF EXISTS Subthemes;
DROP TABLE IF EXISTS Questions;

DROP TABLE IF EXISTS DefiSolo;
DROP TABLE IF EXISTS QuestionsDefi;

-- Basic tables for the app :

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    Description TEXT,
    admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Subthemes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    theme_id INT REFERENCES Themes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Questions (
    id SERIAL PRIMARY KEY,
    subtheme_id INT REFERENCES Subthemes(id),
    question TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    options TEXT[],
    answer TEXT NOT NULL,
    media TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tables for DefiSolo

CREATE TABLE DefiSolo (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE QuestionsDefi (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES Questions(id),
    defi_id INT REFERENCES DefiSolo(id),
    answer TEXT,
    time_taken INT,
);



INSERT INTO users (username, password, Description, admin)
VALUES
('admin', 'admin', 'Administrator account', TRUE);


SELECT * FROM users;
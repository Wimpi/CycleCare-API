-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS cycleCareDB;

-- Seleccionar la base de datos
USE cycleCareDB;

-- Crear las tablas
CREATE TABLE user (
    username VARCHAR(20) PRIMARY KEY,
    password VARCHAR(10),
    role VARCHAR(30),
    email VARCHAR(100),
    UNIQUE (email)
);

CREATE TABLE person (
    email VARCHAR(100) PRIMARY KEY,
    name NVARCHAR(70),
    firstLastname NVARCHAR(70),
    secondLastName NVARCHAR(70),
    birthdate DATE
);

CREATE TABLE reminderType (
    id INT PRIMARY KEY,
    name VARCHAR(70),
    icon VARBINARY(2000)
);

CREATE TABLE reminder (
    id VARCHAR(50) PRIMARY KEY,
    reminderType INT,
    description NVARCHAR(200),
    title NVARCHAR(70),
    creationDate DATETIME,
    username VARCHAR(20),
    FOREIGN KEY (reminderType) REFERENCES reminderType(id),
    FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE content (
    id VARCHAR(50) PRIMARY KEY,
    title NVARCHAR(70),
    description NVARCHAR(200),
    creationDate DATETIME,
    media VARBINARY(2000),
    username VARCHAR(20),
    FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE rate (
    id VARCHAR(50) PRIMARY KEY,
    value INT,
    username VARCHAR(20),
    FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE contentRating (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contentId VARCHAR(50),
    rateId VARCHAR(50),
    FOREIGN KEY (contentId) REFERENCES content(id),
    FOREIGN KEY (rateId) REFERENCES rate(id)
);

CREATE TABLE menstrualCycle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20),
    isRegular BIT,
    aproxCycleDuration INT,
    aproxPeriodDuration INT,
    FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE period (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(20),
    startDate DATE,
    endDate DATE,
    FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE menstrualFlow (
    id INT PRIMARY KEY,
    name VARCHAR(70),
    icon VARBINARY(2000)
);

CREATE TABLE vaginalFlow (
    id INT PRIMARY KEY,
    name VARCHAR(70),
    icon VARBINARY(2000)
);

CREATE TABLE cycleLog (
    id VARCHAR(50) PRIMARY KEY,
    sleepHours INT,
    username VARCHAR(20),
    creationDate DATE,
    note NVARCHAR(50),
    menstrualFlow INT,
    vaginalFlow INT,
    FOREIGN KEY (username) REFERENCES user(username),
    FOREIGN KEY (menstrualFlow) REFERENCES menstrualFlow(id),
    FOREIGN KEY (vaginalFlow) REFERENCES vaginalFlow(id)
);

CREATE TABLE symptom (
    id INT PRIMARY KEY,
    name VARCHAR(70)
);

CREATE TABLE mood (
    id INT PRIMARY KEY,
    name VARCHAR(70),
    icon VARBINARY(2000)
);

CREATE TABLE medication (
    id INT PRIMARY KEY,
    name VARCHAR(70)
);

CREATE TABLE pill (
    id INT PRIMARY KEY,
    status VARCHAR(20)
);

CREATE TABLE pillLog (
    id VARCHAR(50) PRIMARY KEY,
    pill INT,
    logId VARCHAR(50),
    FOREIGN KEY (pill) REFERENCES pill(id),
    FOREIGN KEY (logId) REFERENCES cycleLog(id)
);

CREATE TABLE symptomLog (
    id VARCHAR(50) PRIMARY KEY,
    symptom INT,
    logId VARCHAR(50),
    FOREIGN KEY (symptom) REFERENCES symptom(id),
    FOREIGN KEY (logId) REFERENCES cycleLog(id)
);

CREATE TABLE moodLog (
    id VARCHAR(50) PRIMARY KEY,
    mood INT,
    logId VARCHAR(50),
    FOREIGN KEY (mood) REFERENCES mood(id),
    FOREIGN KEY (logId) REFERENCES cycleLog(id)
);

CREATE TABLE medicationLog (
    id VARCHAR(50) PRIMARY KEY,
    medication INT,
    logId VARCHAR(50),
    FOREIGN KEY (medication) REFERENCES medication(id),
    FOREIGN KEY (logId) REFERENCES cycleLog(id)
);


CREATE TABLE birthControl (
    id INT PRIMARY KEY,
    status VARCHAR(20),
    name VARCHAR(70)
);

CREATE TABLE birthControlLog (
    id VARCHAR(50) PRIMARY KEY,
    birthcontrol INT,
    logId VARCHAR(50),
    FOREIGN KEY (birthcontrol) REFERENCES birthControl(id),
    FOREIGN KEY (logId) REFERENCES cycleLog(id)
);

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS cycleCareDB;

-- Seleccionar la base de datos
USE cycleCareDB;

CREATE TABLE person (
    email VARCHAR(100) PRIMARY KEY,
    name NVARCHAR(70),
    firstLastname NVARCHAR(70),
    secondLastName NVARCHAR(70)
);

CREATE TABLE user (
    username VARCHAR(20) PRIMARY KEY,
    password VARCHAR(200),
    role VARCHAR(30),
    email VARCHAR(100),
    UNIQUE (email), 
    FOREIGN KEY (email) REFERENCES person(email)
);

CREATE TABLE reminder (
    reminderId INT AUTO_INCREMENT PRIMARY KEY,
    description NVARCHAR(200),
    title NVARCHAR(70),
    creationDate DATETIME,
    scheduleId VARCHAR(255),
    username VARCHAR(20),
    FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE content (
    contentId INT AUTO_INCREMENT PRIMARY KEY,
    title NVARCHAR(70),
    description NVARCHAR(200),
    creationDate DATETIME,
    media VARCHAR(50),
    username VARCHAR(20),
    FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE rate (
    rateId INT AUTO_INCREMENT PRIMARY KEY,
    value INT,
    username VARCHAR(20),
    FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE contentRating (
    contentRatingId INT AUTO_INCREMENT PRIMARY KEY,
    contentId INT,
    rateId INT,
    FOREIGN KEY (contentId) REFERENCES content(contentId),
    FOREIGN KEY (rateId) REFERENCES rate(rateId)
);

CREATE TABLE menstrualCycle (
    mestrualCycleId INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20),
    isRegular BIT,
    aproxCycleDuration INT,
    aproxPeriodDuration INT,
    FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE period (
    periodId INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20),
    startDate DATE,
    endDate DATE,
    FOREIGN KEY (username) REFERENCES user(username)
);

CREATE TABLE menstrualFlow (
    menstrualFlowId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(70)
);

CREATE TABLE vaginalFlow (
    vaginalFlowId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(70)
);

CREATE TABLE cycleLog (
    cycleLogId INT AUTO_INCREMENT PRIMARY KEY,
    sleepHours INT,
    username VARCHAR(20),
    creationDate DATE,
    note NVARCHAR(50),
    menstrualFlowId INT,
    vaginalFlowId INT,
    FOREIGN KEY (username) REFERENCES user(username),
    FOREIGN KEY (menstrualFlowId) REFERENCES menstrualFlow(menstrualFlowId),
    FOREIGN KEY (vaginalFlowId) REFERENCES vaginalFlow(vaginalFlowId)
);

CREATE TABLE symptom (
    symptomId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(70)
);

CREATE TABLE mood (
    moodId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(70)
);

CREATE TABLE medication (
    medicationId INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(70)
);

CREATE TABLE pill (
    pillId INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20)
);

CREATE TABLE pillLog (
    pillLogId INT AUTO_INCREMENT PRIMARY KEY,
    pillId INT,
    cycleLogId INT,
    FOREIGN KEY (pillId) REFERENCES pill(pillId),
    FOREIGN KEY (cycleLogId) REFERENCES cycleLog(cycleLogId)
);

CREATE TABLE symptomLog (
    symptomLogId INT AUTO_INCREMENT PRIMARY KEY,
    symptomId INT,
    cycleLogId INT,
    FOREIGN KEY (symptomId) REFERENCES symptom(symptomId),
    FOREIGN KEY (cycleLogId) REFERENCES cycleLog(cycleLogId)
);

CREATE TABLE moodLog (
    moodLogId INT AUTO_INCREMENT PRIMARY KEY,
    moodId INT,
    cycleLogId INT,
    FOREIGN KEY (moodId) REFERENCES mood(moodId),
    FOREIGN KEY (cycleLogId) REFERENCES cycleLog(cycleLogId)
);

CREATE TABLE medicationLog (
    medicationLogId INT AUTO_INCREMENT PRIMARY KEY,
    medicationId INT,
    cycleLogId INT,
    FOREIGN KEY (medicationId) REFERENCES medication(medicationId),
    FOREIGN KEY (cycleLogId) REFERENCES cycleLog(cycleLogId)
);

CREATE TABLE birthControl (
    birthControlId INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20),
    name VARCHAR(70)
);

CREATE TABLE birthControlLog (
    birthControlLogId INT AUTO_INCREMENT PRIMARY KEY,
    birthControlId INT,
    cycleLogId INT,
    FOREIGN KEY (birthControlId) REFERENCES birthControl(birthControlId),
    FOREIGN KEY (cycleLogId) REFERENCES cycleLog(cycleLogId)
);

INSERT INTO symptom (name) VALUES ('Dolor abdominal');
INSERT INTO symptom (name) VALUES ('Sensibilidad en los senos');
INSERT INTO symptom (name) VALUES ('Acné');
INSERT INTO symptom (name) VALUES ('Hinchazón abdominal');
INSERT INTO symptom (name) VALUES ('Fatiga');
INSERT INTO symptom (name) VALUES ('Dolor de cabeza');
INSERT INTO symptom (name) VALUES ('Náuseas');
INSERT INTO symptom (name) VALUES ('Mareos');
INSERT INTO symptom (name) VALUES ('Antojos');
INSERT INTO symptom (name) VALUES ('Estreñimiento');
INSERT INTO symptom (name) VALUES ('Diarrea');
INSERT INTO symptom (name) VALUES ('Insomnio');
INSERT INTO symptom (name) VALUES ('Picazón vaginal');
INSERT INTO symptom (name) VALUES ('Dolor en vulva');

INSERT INTO vaginalFlow (name) VALUES ('Seco');
INSERT INTO vaginalFlow (name) VALUES ('Pegajoso');
INSERT INTO vaginalFlow (name) VALUES ('Cremoso');
INSERT INTO vaginalFlow (name) VALUES ('Acuoso');
INSERT INTO vaginalFlow (name) VALUES ('Elástico');

INSERT INTO moods (name) VALUES ('Feliz');
INSERT INTO moods (name) VALUES ('Triste');
INSERT INTO moods (name) VALUES ('Ansiosa');
INSERT INTO moods (name) VALUES ('Enojada');
INSERT INTO moods (name) VALUES ('Cansada');
INSERT INTO moods (name) VALUES ('Energética');
INSERT INTO moods (name) VALUES ('Relajada');
INSERT INTO moods (name) VALUES ('Concentrada');
INSERT INTO moods (name) VALUES ('Estresada');
INSERT INTO moods (name) VALUES ('Irritada');

INSERT INTO menstrualFlow (name) VALUES ('Ligero');
INSERT INTO menstrualFlow (name) VALUES ('Moderado');
INSERT INTO menstrualFlow (name) VALUES ('Abundante');

INSERT INTO medication (name) VALUES ('Terapia hormonal');
INSERT INTO medication (name) VALUES ('Pastilla de emergencia');
INSERT INTO medication (name) VALUES ('Analgésicos');
INSERT INTO medication (name) VALUES ('Antidepresivos');
INSERT INTO medication (name) VALUES ('Antibióticos');
INSERT INTO medication (name) VALUES ('Antihistamínicos');

INSERT INTO pill (status) VALUES ('Tomada');
INSERT INTO pill (status) VALUES ('Olvidada');
INSERT INTO pill (status) VALUES ('Dosis doble');
INSERT INTO pill (status) VALUES ('Sin dosis');
INSERT INTO pill (status) VALUES ('Tarde');

INSERT INTO birthControl (name) VALUES ('Insertado');
INSERT INTO birthControl (name) VALUES ('Removido');

ALTER TABLE content ADD COLUMN isVideo TINYINT(1);
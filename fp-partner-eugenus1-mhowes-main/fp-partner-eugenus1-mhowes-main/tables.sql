-- This file should include any CREATE statements you used in your database. This file does not
-- need to include header documentation (this is the only exception - all other files must
-- include documentation).

CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_logged_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    major VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Instructors (
    instructor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Courses (
    course_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    instructor_id INTEGER,
    duration VARCHAR(20),
    prerequisites TEXT,
    credits INTEGER,
    time VARCHAR(20),
    description TEXT,
    major VARCHAR(50),
    available_seats INTEGER DEFAULT 0,
    FOREIGN KEY (instructor_id) REFERENCES Instructors(instructor_id)
);

CREATE TABLE IF NOT EXISTS Cart (
    cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    course_id VARCHAR(10),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

CREATE TABLE IF NOT EXISTS CoursePreview (
    preview_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id VARCHAR(10),
    topic VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

CREATE TABLE IF NOT EXISTS UserCompletedCourses (
    user_id INTEGER,
    course_id VARCHAR(10),
    completed BOOLEAN,
    term VARCHAR(10) CHECK(term IN ('Autumn', 'Winter', 'Spring', 'Summer')),
    year INTEGER CHECK(year >= 2024),
    confirmation_number INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id),
    PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS DegreeRequirements (
    degree_id INTEGER PRIMARY KEY AUTOINCREMENT,
    degree_name VARCHAR(100) NOT NULL,
    degree_type VARCHAR(10) NOT NULL,
    department VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS DegreeCourses (
    degree_id INTEGER,
    course_id VARCHAR(10),
    is_required BOOLEAN,
    FOREIGN KEY (degree_id) REFERENCES DegreeRequirements(degree_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id),
    PRIMARY KEY (degree_id, course_id)
);

INSERT INTO Users (username, password, email, is_logged_in, major) VALUES
('tech_enthusiast', 'P@ssw0rd123', 'tech.enthusiast@email.com', FALSE, 'Computer Science'),
('data_wizard', 'D@taRules2023', 'data.wizard@email.com', FALSE, 'Data Science'),
('web_developer', 'W3bD3v2023!', 'web.developer@email.com', FALSE, 'Web Development'),
('ai_researcher', 'AI_Future2023', 'ai.researcher@email.com', FALSE, 'Artificial Intelligence'),
('cybersecurity_expert', 'S3cureN3t2023', 'cybersecurity.expert@email.com', FALSE, 'Cybersecurity');

INSERT INTO Instructors (name, bio, email) VALUES
('Dr. Alan Turing', 'Computer Science pioneer', 'alan.turing@university.edu'),
('Prof. Ada Lovelace', 'First computer programmer', 'ada.lovelace@university.edu'),
('Dr. Grace Hopper', 'Developed first compiler', 'grace.hopper@university.edu'),
('Prof. Tim Berners-Lee', 'Inventor of the World Wide Web', 'tim.berners-lee@university.edu'),
('Dr. Fei-Fei Li', 'AI and machine learning expert', 'fei-fei.li@university.edu'),
('Prof. Yoshua Bengio', 'Deep learning researcher', 'yoshua.bengio@university.edu'),
('Dr. Barbara Liskov', 'Programming language designer', 'barbara.liskov@university.edu'),
('Prof. Donald Knuth', 'Computer programming expert', 'donald.knuth@university.edu'),
('Dr. Shafi Goldwasser', 'Cryptography specialist', 'shafi.goldwasser@university.edu'),
('Prof. Raj Reddy', 'AI and robotics pioneer', 'raj.reddy@university.edu');

INSERT INTO Courses (course_id, name, category, instructor_id, duration, prerequisites, credits, time, description, major, available_seats) VALUES
('CS101', 'Introduction to Computer Science', 'Computer Science', 1, '8 weeks', 'None', 3, '10:00 AM', 'Learn the basics of computer science and programming.', 'Computer Science', 30),
('AI201', 'Artificial Intelligence Basics', 'AI', 5, '10 weeks', 'CS101', 4, '2:00 PM', 'Explore the fundamentals of artificial intelligence and machine learning.', 'Artificial Intelligence', 25),
('WEB301', 'Web Development Fundamentals', 'Web Development', 4, '6 weeks', 'None', 3, '1:00 PM', 'Master the essentials of HTML, CSS, and JavaScript for web development.', 'Web Development', 35),
('DB401', 'Database Management Systems', 'Databases', 7, '8 weeks', 'CS101', 4, '11:00 AM', 'Learn to design, implement, and manage relational databases using SQL.', 'Database Management', 20),
('ML501', 'Machine Learning Algorithms', 'AI', 6, '12 weeks', 'AI201', 5, '3:00 PM', 'Dive deep into various machine learning algorithms and their applications.', 'Artificial Intelligence', 25),
('SEC601', 'Cybersecurity Principles', 'Security', 9, '10 weeks', 'CS101', 4, '4:00 PM', 'Understand core concepts of cybersecurity and learn to protect digital assets.', 'Cybersecurity', 15),
('PROG201', 'Advanced Programming Techniques', 'Programming', 8, '8 weeks', 'CS101', 4, '9:00 AM', 'Enhance your programming skills with advanced concepts and best practices.', 'Computer Science', 30),
('NET301', 'Computer Networking', 'Networking', 2, '6 weeks', 'CS101', 3, '2:00 PM', 'Explore the fundamentals of computer networks and network protocols.', 'Computer Networking', 30),
('ROBO401', 'Introduction to Robotics', 'Robotics', 10, '10 weeks', 'AI201', 4, '1:00 PM', 'Learn the basics of robotics, including mechanics, electronics, and programming.', 'Robotics', 20),
('ALGO501', 'Advanced Algorithms', 'Computer Science', 3, '12 weeks', 'PROG201', 5, '11:00 AM', 'Study complex algorithms and data structures for efficient problem-solving.', 'Computer Science', 30),
('DS201', 'Data Science Fundamentals', 'Data Science', 5, '10 weeks', 'CS101', 4, '10:00 AM', 'Introduction to data analysis, visualization, and statistical methods.', 'Data Science', 25),
('SE301', 'Software Engineering Principles', 'Software Engineering', 7, '8 weeks', 'PROG201', 3, '2:00 PM', 'Learn best practices in software development and project management.', 'Software Engineering', 30),
('CLOUD401', 'Cloud Computing Technologies', 'Cloud Computing', 4, '10 weeks', 'NET301', 4, '3:00 PM', 'Explore cloud architectures, services, and deployment models.', 'Computer Science', 25),
('MOBILE501', 'Mobile App Development', 'Mobile Development', 8, '12 weeks', 'PROG201', 5, '1:00 PM', 'Create mobile applications for iOS and Android platforms.', 'Software Engineering', 20),
('IOT301', 'Internet of Things', 'IoT', 10, '8 weeks', 'NET301', 3, '11:00 AM', 'Understand IoT ecosystems, protocols, and applications.', 'Computer Science', 25),
('CRYPTO401', 'Cryptography and Network Security', 'Security', 9, '10 weeks', 'SEC601', 4, '4:00 PM', 'Advanced topics in cryptography and secure communication protocols.', 'Cybersecurity', 20),
('VR501', 'Virtual Reality Development', 'VR/AR', 6, '12 weeks', 'PROG201', 5, '2:00 PM', 'Create immersive VR experiences and applications.', 'Computer Science', 15),
('NLP401', 'Natural Language Processing', 'AI', 5, '10 weeks', 'AI201', 4, '10:00 AM', 'Techniques for processing and analyzing human language data.', 'Artificial Intelligence', 25),
('BIGDATA501', 'Big Data Analytics', 'Data Science', 7, '12 weeks', 'DS201', 5, '3:00 PM', 'Process and analyze large-scale datasets using distributed computing.', 'Data Science', 20),
('DEVOPS301', 'DevOps Practices', 'Software Engineering', 8, '8 weeks', 'SE301', 3, '1:00 PM', 'Learn continuous integration, delivery, and deployment practices.', 'Software Engineering', 30),
('SE401', 'Software Architecture', 'Software Engineering', 7, '10 weeks', 'SE301', 4, '9:00 AM', 'Learn to design and evaluate software architectures for complex systems.', 'Software Engineering', 25),
('SE501', 'Software Testing and Quality Assurance', 'Software Engineering', 8, '8 weeks', 'SE301', 3, '2:00 PM', 'Master techniques for ensuring software quality through testing and QA processes.', 'Software Engineering', 30),
('CLOUD501', 'Serverless Computing', 'Cloud Computing', 4, '6 weeks', 'CLOUD401', 3, '11:00 AM', 'Explore serverless architectures and their implementation in cloud environments.', 'Cloud Computing', 25),
('CLOUD601', 'Cloud Security', 'Cloud Computing', 9, '8 weeks', 'CLOUD401,SEC601', 4, '3:00 PM', 'Learn to secure cloud infrastructure and applications against various threats.', 'Cloud Computing', 20),
('DE301', 'Data Warehousing', 'Data Engineering', 7, '10 weeks', 'DB401', 4, '10:00 AM', 'Design and implement data warehouses for efficient data storage and retrieval.', 'Data Engineering', 25),
('DE401', 'ETL Processes', 'Data Engineering', 5, '8 weeks', 'DE301', 3, '1:00 PM', 'Master Extract, Transform, Load (ETL) processes for effective data integration.', 'Data Engineering', 30),
('SEC701', 'Ethical Hacking', 'Security', 9, '12 weeks', 'SEC601,NET301', 5, '9:00 AM', 'Learn offensive security techniques to identify and fix vulnerabilities.', 'Information Security', 20),
('SEC801', 'Digital Forensics', 'Security', 9, '10 weeks', 'SEC601', 4, '2:00 PM', 'Explore techniques for collecting and analyzing digital evidence in cybercrime investigations.', 'Information Security', 25),
('HCI301', 'User Experience Design', 'HCI', 4, '8 weeks', 'None', 3, '11:00 AM', 'Learn principles and practices of designing effective user experiences.', 'Human-Computer Interaction', 35),
('HCI401', 'Usability Engineering', 'HCI', 4, '10 weeks', 'HCI301', 4, '3:00 PM', 'Apply scientific methods to evaluate and improve user interface designs.', 'Human-Computer Interaction', 30),
('AI601', 'Deep Reinforcement Learning', 'AI', 6, '12 weeks', 'ML501', 5, '1:00 PM', 'Explore advanced AI techniques combining deep learning and reinforcement learning.', 'Artificial Intelligence', 20),
('DS601', 'Time Series Analysis', 'Data Science', 5, '10 weeks', 'DS201,ML501', 4, '10:00 AM', 'Learn techniques for analyzing and forecasting time-dependent data.', 'Data Science', 25),
('IOT401', 'Edge Computing', 'IoT', 10, '8 weeks', 'IOT301,NET301', 3, '2:00 PM', 'Explore data processing at the edge of the network in IoT systems.', 'Computer Science', 30),
('MOBILE601', 'Cross-Platform Mobile Development', 'Mobile Development', 8, '10 weeks', 'MOBILE501', 4, '11:00 AM', 'Build mobile apps that work on multiple platforms using frameworks like React Native.', 'Software Engineering', 25),
('VR601', 'Augmented Reality Development', 'VR/AR', 6, '10 weeks', 'VR501', 4, '3:00 PM', 'Create AR applications for mobile devices and headsets.', 'Computer Science', 20);

INSERT INTO CoursePreview (course_id, topic) VALUES
('CS101', 'Introduction to Programming'),
('AI201', 'Machine Learning Basics'),
('WEB301', 'HTML and CSS Fundamentals'),
('DB401', 'SQL and Relational Databases'),
('ML501', 'Neural Networks'),
('SEC601', 'Encryption Techniques'),
('PROG201', 'Object-Oriented Programming'),
('NET301', 'TCP/IP Protocols'),
('ROBO401', 'Sensor Integration'),
('ALGO501', 'Graph Algorithms'),
('DS201', 'Data Visualization Techniques'),
('SE301', 'Agile Methodologies'),
('CLOUD401', 'Containerization and Orchestration'),
('MOBILE501', 'User Interface Design for Mobile'),
('IOT301', 'IoT Sensor Networks'),
('CRYPTO401', 'Public Key Infrastructure'),
('VR501', '3D Modeling for VR'),
('NLP401', 'Text Classification Algorithms'),
('BIGDATA501', 'Hadoop Ecosystem'),
('DEVOPS301', 'Continuous Integration Tools'),
('SE401', 'Architectural Patterns'),
('SE501', 'Test-Driven Development'),
('CLOUD501', 'AWS Lambda Functions'),
('CLOUD601', 'Cloud Access Security Brokers'),
('DE301', 'Star Schema Design'),
('DE401', 'Data Pipeline Orchestration'),
('SEC701', 'Penetration Testing Methodologies'),
('SEC801', 'Chain of Custody in Digital Forensics'),
('HCI301', 'Wireframing and Prototyping'),
('HCI401', 'Cognitive Walkthrough'),
('AI601', 'Policy Gradient Methods'),
('DS601', 'ARIMA Models'),
('IOT401', 'Fog Computing'),
('MOBILE601', 'React Native Components'),
('VR601', 'ARCore and ARKit');

INSERT INTO DegreeRequirements (degree_name, degree_type, department) VALUES
('Computer Science', 'major', 'Computer Science'),
('Artificial Intelligence', 'major', 'Computer Science'),
('Web Development', 'major', 'Computer Science'),
('Cybersecurity', 'major', 'Computer Science'),
('Data Science', 'major', 'Computer Science'),
('Software Engineering', 'major', 'Computer Science'),
('Cloud Computing', 'major', 'Computer Science'),
('Data Engineering', 'major', 'Computer Science'),
('Information Security', 'major', 'Computer Science'),
('Human-Computer Interaction', 'major', 'Computer Science');

INSERT INTO DegreeCourses (degree_id, course_id, is_required) VALUES
(1, 'CS101', TRUE),
(1, 'PROG201', TRUE),
(1, 'ALGO501', TRUE),
(1, 'DB401', TRUE),
(1, 'NET301', TRUE),
(1, 'SE301', TRUE),
(1, 'CLOUD401', FALSE),
(1, 'IOT301', FALSE),
(2, 'CS101', TRUE),
(2, 'AI201', TRUE),
(2, 'ML501', TRUE),
(2, 'NLP401', TRUE),
(2, 'ROBO401', FALSE),
(2, 'DS201', FALSE),
(3, 'CS101', TRUE),
(3, 'WEB301', TRUE),
(3, 'PROG201', TRUE),
(3, 'DB401', TRUE),
(3, 'MOBILE501', FALSE),
(3, 'DEVOPS301', FALSE),
(4, 'CS101', TRUE),
(4, 'SEC601', TRUE),
(4, 'NET301', TRUE),
(4, 'CRYPTO401', TRUE),
(4, 'DB401', FALSE),
(4, 'CLOUD401', FALSE),
(5, 'CS101', TRUE),
(5, 'DS201', TRUE),
(5, 'ML501', TRUE),
(5, 'DB401', TRUE),
(5, 'BIGDATA501', TRUE),
(5, 'AI201', FALSE),
(6, 'SE401', TRUE),
(6, 'SE501', TRUE),
(7, 'CLOUD501', TRUE),
(7, 'CLOUD601', TRUE),
(8, 'DE301', TRUE),
(8, 'DE401', TRUE),
(9, 'SEC701', TRUE),
(9, 'SEC801', TRUE),
(10, 'HCI301', TRUE),
(10, 'HCI401', TRUE);

ALTER TABLE Users ADD COLUMN minor VARCHAR(50);
ALTER TABLE Courses ADD COLUMN minor VARCHAR(50);
ALTER TABLE DegreeRequirements ADD COLUMN is_minor BOOLEAN DEFAULT FALSE;

UPDATE Users
SET minor = 'Artificial Intelligence'
WHERE username = 'tech_enthusiast';

UPDATE Users
SET minor = 'Web Development'
WHERE username = 'data_wizard';

UPDATE Users
SET minor = 'Cybersecurity'
WHERE username = 'web_developer';

UPDATE Users
SET minor = 'Data Science'
WHERE username = 'ai_researcher';

UPDATE Users
SET minor = 'Software Engineering'
WHERE username = 'cybersecurity_expert';

UPDATE Courses
SET minor = 'Computer Science'
WHERE major = 'Computer Science';

UPDATE Courses
SET minor = 'Artificial Intelligence'
WHERE major = 'Artificial Intelligence';

UPDATE Courses
SET minor = 'Web Development'
WHERE major = 'Web Development';

UPDATE Courses
SET minor = 'Cybersecurity'
WHERE major = 'Cybersecurity';

UPDATE Courses
SET minor = 'Data Science'
WHERE major = 'Data Science';

INSERT INTO DegreeRequirements (degree_name, degree_type, department, is_minor)
VALUES
('Computer Science', 'minor', 'Computer Science', TRUE),
('Artificial Intelligence', 'minor', 'Computer Science', TRUE),
('Web Development', 'minor', 'Computer Science', TRUE),
('Cybersecurity', 'minor', 'Computer Science', TRUE),
('Data Science', 'minor', 'Computer Science', TRUE);

INSERT INTO DegreeCourses (degree_id, course_id, is_required)
VALUES
(11, 'CS101', TRUE), -- Computer Science Minor
(11, 'PROG201', TRUE),
(11, 'ALGO501', FALSE),

(12, 'CS101', TRUE), -- Artificial Intelligence Minor
(12, 'AI201', TRUE),
(12, 'ML501', FALSE),

(13, 'CS101', TRUE), -- Web Development Minor
(13, 'WEB301', TRUE),
(13, 'PROG201', FALSE),

(14, 'CS101', TRUE), -- Cybersecurity Minor
(14, 'SEC601', TRUE),
(14, 'CRYPTO401', FALSE),

(15, 'CS101', TRUE), -- Data Science Minor
(15, 'DS201', TRUE),
(15, 'ML501', FALSE);

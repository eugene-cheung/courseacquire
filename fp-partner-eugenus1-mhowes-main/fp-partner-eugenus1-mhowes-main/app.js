/*
 * Names: Mason Howes, Eugene Cheung
 * Date: December 10th, 2024
 * Section: CSE 154 AD
 *
 * This is the API to implement server side functionality to the CourseAcquire webpage.
 * It allows a multitude of endpoints to be accessed to communicate with the course_enrollment.db
 * SQL database.
 */

"use strict";

const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SUCCESS = 200;
const MISSING = 404;
const FAIL = 400;
const S_FAIL = 500;
const SERVER_ERROR = 'An error occurred on the server. Try again later.';
const DEFAULT_PORT = 8000;

/**
 * Establishes a database connection to the SQLite database.
 * @returns {Promise<sqlite.Database>} Database connection object.
 */
async function getDbConnection() {
  const DB = await sqlite.open({
    filename: path.join(__dirname, "course_enrollment.db"),
    driver: sqlite3.Database
  });
  return DB;
}

/**
 * Endpoint: Serve the homepage.
 * GET /
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Endpoint: Register a new user.
 * POST /register
 */
app.post("/register", async (req, res) => {
  let {username, email, password} = req.body;

  if (!username || !email || !password) {
    return resSend(res, FAIL, 'json', 'Missing one or more required fields.');
  }

  try {
    let db = await getDbConnection();
    let userExists = await db.all(`
      SELECT *
      FROM Users
      WHERE username = ? OR email = ?
    `, [username, email]);

    if (userExists) {
      return resSend(res, FAIL, 'json', 'Username or email already exists');
    }

    await db.run(
      "INSERT INTO Users (username, email, password, major, minor) VALUES (?, ?, ?, ?, ?)",
      [username, email, password, "Computer Science", "Computer Science"]
    );

    resSend(res, SUCCESS, 'json', 'User registered successfully!');
  } catch (error) {
    resSend(res, S_FAIL, 'json', SERVER_ERROR);
  }
});

/**
 * Endpoint: Login an existing user.
 * POST /login
 */
app.post("/login", async (req, res) => {
  let {username, password} = req.body;

  if (!username || !password) {
    return resSend(res, FAIL, 'json', 'Missing username or password.');
  }

  try {
    let db = await getDbConnection();
    let user = await db.get(
      "SELECT * FROM Users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (!user) {
      return resSend(res, FAIL, 'json', 'Invalid username or password.');
    }

    await db.run("UPDATE Users SET is_logged_in = TRUE WHERE username = ?", [username]);

    resSend(res, SUCCESS, 'json', {message: 'Login successful!', username});
  } catch (error) {
    resSend(res, S_FAIL, 'json', SERVER_ERROR);
  }
});

/**
 * Endpoint: Check if a user is logged in.
 * GET /check-login
 */
app.get("/check-login", async (req, res) => {
  try {
    let db = await getDbConnection();
    let user = await db.get("SELECT * FROM Users WHERE is_logged_in = TRUE LIMIT 1");
    if (user) {
      res.status(SUCCESS).json({isLoggedIn: true, username: user.username});
    } else {
      res.status(SUCCESS).json({isLoggedIn: false});
    }
  } catch (error) {
    console.error(error);
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Logout the logged-in user.
 * POST /logout
 */
app.post("/logout", async (req, res) => {
  let {username} = req.body;

  if (!username) {
    return resSend(res, FAIL, 'json', 'Missing username.');
  }

  try {
    let db = await getDbConnection();
    await db.run("UPDATE Users SET is_logged_in = FALSE WHERE username = ?", [username]);
    resSend(res, SUCCESS, 'json', 'Logout successful!');
  } catch (error) {
    resSend(res, S_FAIL, 'json', SERVER_ERROR);
  }
});

/**
 * Endpoint: Get the email of the currently logged-in user.
 * GET /grab-email
 */
app.get("/grab-email", async (req, res) => {
  try {
    let db = await getDbConnection();
    let user = await db.get("SELECT email FROM Users WHERE is_logged_in = TRUE LIMIT 1");

    if (!user) {
      return resSend(res, MISSING, 'json', 'No user is currently logged in.');
    }

    resSend(res, SUCCESS, 'json', {email: user.email});
  } catch (error) {
    resSend(res, S_FAIL, 'json', SERVER_ERROR);
  }
});

/**
 * Endpoint: Fetch all available courses.
 * GET /courses
 */
app.get("/courses", async (req, res) => {
  try {
    let db = await getDbConnection();
    let courses = await db.all("SELECT * FROM Courses");
    res.status(SUCCESS).json({courses});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Add a course to the user's cart.
 * POST /add-to-cart
 */
app.post('/add-to-cart', async (req, res) => {
  let {courseId} = req.body;
  try {
    let db = await getDbConnection();
    let user = await db.get("SELECT * FROM Users WHERE is_logged_in = TRUE LIMIT 1");
    if (!user) {
      return res.status(FAIL).json({message: 'User not logged in'});
    }
    await db.run(`
      INSERT OR REPLACE INTO Cart (user_id, course_id) VALUES (?, ?)
    `, [user.user_id, courseId]);
    res.status(SUCCESS).json({message: 'Course added to cart'});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Retrieve the user's cart.
 * GET /get-cart
 */
app.get('/get-cart', async (req, res) => {
  try {
    let db = await getDbConnection();
    let user = await db.get("SELECT * FROM Users WHERE is_logged_in = TRUE LIMIT 1");
    if (!user) {
      return res.status(FAIL).json({message: 'User not logged in'});
    }
    let cart = await db.all(`
      SELECT c.*
      FROM Cart ct
      JOIN Courses c ON ct.course_id = c.course_id
      WHERE ct.user_id = ?
    `, [user.user_id]);
    res.status(SUCCESS).json({cart});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Remove a course from the user's cart.
 * POST /remove-from-cart
 */
app.post('/remove-from-cart', async (req, res) => {
  let {courseId} = req.body;
  try {
    let db = await getDbConnection();
    let user = await db.get("SELECT * FROM Users WHERE is_logged_in = TRUE LIMIT 1");
    if (!user) {
      return res.status(FAIL).json({message: 'User not logged in'});
    }
    await db.run('DELETE FROM Cart WHERE user_id = ? AND course_id = ?', [user.user_id, courseId]);
    res.status(SUCCESS).json({message: 'Course removed from cart'});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Get courses the user is enrolled in.
 * GET /enrolled-courses
 */
app.get('/enrolled-courses', async (req, res) => {
  let username = req.session.username;
  if (!username) {
    return res.status(FAIL).json({message: 'User not logged in'});
  }

  try {
    let db = await getDbConnection();
    let courses = await db.all(`
      SELECT c.* FROM Courses c
      JOIN Enrollments e ON c.course_id = e.course_id
      JOIN Users u ON e.user_id = u.user_id
      WHERE u.username = ?
    `, [username]);
    res.status(SUCCESS).json({courses});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Fetch the user's completed course history.
 * GET /course-history
 */
app.get('/course-history', async (req, res) => {
  try {
    let db = await getDbConnection();
    let user = await db.get("SELECT username FROM Users WHERE is_logged_in = TRUE LIMIT 1");
    if (!user.username) {
      return res.status(FAIL).json({message: 'User not logged in'});
    }

    let courses = await db.all(`
      SELECT c.*, ucc.term, ucc.year, ucc.confirmation_number
      FROM Courses c
      JOIN UserCompletedCourses ucc ON c.course_id = ucc.course_id
      JOIN Users u ON ucc.user_id = u.user_id
      WHERE u.username = ?
      ORDER BY ucc.year DESC, ucc.term DESC
    `, [user.username]);

    res.status(SUCCESS).json({courses});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Fetch all available majors.
 * GET /available-majors
 */
app.get("/available-majors", async (req, res) => {
  try {
    const db = await getDbConnection();

    let majors = await db.all("SELECT degree_name FROM DegreeRequirements WHERE is_minor = FALSE");

    res.status(SUCCESS).json({majors});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Fetch all available minors.
 * GET /available-minors
 */
app.get("/available-minors", async (req, res) => {
  try {
    const db = await getDbConnection();

    let minors = await db.all("SELECT degree_name FROM DegreeRequirements WHERE is_minor = TRUE");

    res.status(SUCCESS).json({minors});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Update the user's major.
 * PUT /update-major
 */
app.put('/update-major', async (req, res) => {
  try {
    let {major} = req.body;

    if (!major) {
      return res.status(FAIL).json({message: 'Major is required'});
    }

    let db = await getDbConnection();
    let user = await db.get("SELECT user_id FROM Users WHERE is_logged_in = TRUE LIMIT 1");

    if (!user) {
      return res.status(FAIL).json({message: 'User not logged in'});
    }

    await db.run("UPDATE Users SET major = ? WHERE user_id = ?", [major, user.user_id]);

    res.status(SUCCESS).json({message: 'Major updated successfully'});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Update the user's minor.
 * PUT /update-minor
 */
app.put('/update-minor', async (req, res) => {
  try {
    let {minor} = req.body;

    if (!minor) {
      return res.status(FAIL).json({message: 'Minor is required'});
    }

    let db = await getDbConnection();
    let user = await db.get("SELECT user_id FROM Users WHERE is_logged_in = TRUE LIMIT 1");

    if (!user) {
      return res.status(FAIL).json({message: 'User not logged in'});
    }

    await db.run("UPDATE Users SET minor = ? WHERE user_id = ?", [minor, user.user_id]);

    res.status(SUCCESS).json({message: 'Minor updated successfully'});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Get the user's major and required courses.
 * GET /user-major-information
 */
app.get('/user-major-information', async (req, res) => {
  try {
    const db = await getDbConnection();
    let majorRow = await db.get("SELECT major FROM Users WHERE is_logged_in = TRUE LIMIT 1");
    if (!majorRow) {
      return resSend(res, MISSING, 'json', 'No major exists with that name');
    }
    let major = majorRow.major;

    let majorIdRow = await db.get(`
      SELECT degree_id
      FROM DegreeRequirements
      WHERE degree_name = ? AND is_minor = FALSE
    `, [major]);
    if (!majorIdRow) {
      return resSend(res, MISSING, 'json', 'No major exists with that id');
    }
    let majorId = majorIdRow.degree_id;

    let majorCourses = await db.all("SELECT * FROM DegreeCourses WHERE degree_id = ?", [majorId]);
    if (!majorCourses.length) {
      return resSend(res, MISSING, 'json', 'No courses exist for that major');
    }
    res.status(SUCCESS).json({major, majorCourses});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Get the user's minor and required courses.
 * GET /user-minor-information
 */
app.get('/user-minor-information', async (req, res) => {
  try {
    const db = await getDbConnection();

    let minorRow = await db.get("SELECT minor FROM Users WHERE is_logged_in = TRUE LIMIT 1");
    if (!minorRow) {
      return resSend(res, MISSING, 'json', 'No minor exists with that name');
    }
    let minor = minorRow.minor;

    let minorIdRow = await db.get(`
      SELECT degree_id
      FROM DegreeRequirements
      WHERE degree_name = ? AND is_minor = TRUE
    `, [minor]);
    if (!minorIdRow) {
      return resSend(res, MISSING, 'json', 'No minor exists with that id');
    }
    let minorId = minorIdRow.degree_id;

    let minorCourses = await db.all("SELECT * FROM DegreeCourses WHERE degree_id = ?", [minorId]);
    if (!minorCourses.length) {
      return resSend(res, MISSING, 'json', 'No courses exist for that minor');
    }
    res.status(SUCCESS).json({minor, minorCourses});
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Endpoint: Enroll the user in courses from their cart.
 * POST /enroll
 */
app.post('/enroll', async (req, res) => {
  try {
    const {cart, term, year} = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(FAIL).json({message: 'Invalid cart data'});
    }

    if (!term || !year) {
      return res.status(FAIL).json({message: 'Missing term or year'});
    }

    let db = await getDbConnection();
    let user = await db.get("SELECT * FROM Users WHERE is_logged_in = TRUE LIMIT 1");
    if (!user) {
      return res.status(FAIL).json({message: 'User not logged in'});
    }

    let enrollmentSuccess = true;
    let enrolledCourses = [];
    const confirmationNumber = generateConfirmationNumber();
    let failureReason = '';

    for (let course of cart) {
      let go = true;
      let completedCourse = await db.get(`
        SELECT * FROM UserCompletedCourses
        WHERE user_id = ? AND course_id = ?
      `, [user.user_id, course.course_id]);

      if (completedCourse && go) {
        enrollmentSuccess = false;
        failureReason = `Course ${course.course_id} already completed by user ${user.user_id}`;
        go = false;
      }

      let dbCourse = await db.get('SELECT * FROM Courses WHERE course_id = ?', [course.course_id]);
      if (!dbCourse && go) {
        enrollmentSuccess = false;
        failureReason = `Course ${course.course_id} not found in database`;
        go = false;
      }

      if (dbCourse.available_seats <= 0 && go) {
        enrollmentSuccess = false;
        failureReason = `No available seats for course ${course.course_id}`;
        go = false;
      }

      if (!await checkPrerequisites(user.user_id, dbCourse.prerequisites) && go) {
        enrollmentSuccess = false;
        failureReason = `User ${user.user_id} does not meet prerequisites for` +
        ` course ${course.course_id}`;
        go = false;
      }

      if (go) {
        await db.run(`
          INSERT INTO UserCompletedCourses ` +
          `(user_id, course_id, completed, term, year, confirmation_number)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [user.user_id, course.course_id, 0, term, year, confirmationNumber]);

        await db.run(`
          UPDATE Courses
          SET available_seats = available_seats - 1
          WHERE course_id = ?
        `, [course.course_id]);
        enrolledCourses.push(course.course_id);
      }
    }

    if (enrollmentSuccess) {
      await db.run('DELETE FROM Cart WHERE user_id = ?', [user.user_id]);
      res.status(SUCCESS).json({
        message: 'Enrollment successful',
        confirmationNumber,
        enrolledCourses
      });
    } else {
      res.status(FAIL).json({message: `Enrollment failed: ${failureReason}`});
    }
  } catch (error) {
    res.status(S_FAIL).json({message: SERVER_ERROR});
  }
});

/**
 * Checks if a user has completed the required prerequisites for a course.
 * @param {number} userId - User's ID.
 * @param {string} prerequisites - Comma-separated prerequisite courses.
 * @returns {Promise<boolean>} True if prerequisites are met, else false.
 */
async function checkPrerequisites(userId, prerequisites) {
  try {
    if (prerequisites === 'None' || prerequisites.trim() === '') {
      return true;
    }

    let db = await getDbConnection();
    let completedCourses = await db.all(`
      SELECT course_id
      FROM UserCompletedCourses
      WHERE user_id = ?
    `, [userId]);
    let completedCoursesSet = new Set(completedCourses.map(course => course.course_id));
    let prereqList = prerequisites.split(',').map(pr => pr.trim());
    return prereqList.every(prereq => completedCoursesSet.has(prereq));
  } catch (error) {
    return false;
  }
}

/**
 * Sends a response with a specified status and message.
 * @param {Object} res - Express response object.
 * @param {number} status - HTTP status code.
 * @param {string} type - Response type ('json' or other).
 * @param {string} text - Message to send in response.
 */
function resSend(res, status, type, text) {
  if (type === 'json') {
    res.status(status)
      .json({message: text});
  } else {
    res.status(status)
      .type(type)
      .send(text);
  }
}

/**
 * Generates a confirmation number for enrollment transactions.
 * @returns {string} A randomly generated confirmation number.
 */
function generateConfirmationNumber() {
  const STR_NUM = 36;
  const SUBSTR_ONE = 2;
  const SUBSTR_TWO = 15;
  return Math.random()
    .toString(STR_NUM)
    .substring(SUBSTR_ONE, SUBSTR_TWO)
    .toUpperCase();
}

const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);
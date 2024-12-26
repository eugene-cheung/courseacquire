# Course Enrollment Site API Documentation

This API provides access to a course enrollment system where users can view courses, register, manage their enrollment, search & filter courses, preview course content, view instructors profile & courses they offer, and manage your cart.

## Fetch All Courses

**Request Format:** `/courses`

**Request Type:** GET

**Returned Data Format:** JSON

**Description:** Fetches a list of all available courses, including key details such as course name, category, instructor, duration, and prerequisites.

**Example Request:** `GET /courses`

**Example Response:**
```json
[
  {
    "courseId": "PY101",
    "name": "Python I",
    "category": "Programming",
    "instructor": "John Doe",
    "duration": "4 weeks",
    "prerequisites": "None",
    "credits": 3,
    "time": "3:00PM"
  },
  {
    "courseId": "JAVA201",
    "name": "Java II",
    "category": "Programming",
    "instructor": "Jane Smith",
    "duration": "6 weeks",
    "prerequisites": "Java I",
    "credits": 4,
    "time": "Asynchronous"
  }
]
```

**Error Handling**: If no courses are found:

```json
{
  "error": "No courses available."
}
```

## Enroll in a Course
**Request Format:** `/enroll`

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Allows a user to enroll in a specific course. Requires the user's account ID and the course ID

**Example Request:** `POST /enroll`

**Example Response:**

```json
{
  "userId": "12345",
  "courseId": "PY101"
}
```

**Error Handling:**
If the course is full:
```json
{
  "error": "The course is full."
}
```

If the user is already enrolled in the course:
```json
{
  "error": "User already enrolled in this course"
}
```

If there was a server error with registration:
```json
{
  "error": "There was a problem registering, please try again later."
}

If user is not logged in:
```json
{
  "error": "Please log in and try again."
}

## Registering
Registers a new user.

**Request Format:** /register

**Request Type:** POST

**Returned Data**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Resposne:** Status: 200 OK
Body: {"message": "User registered successfully!"}

## Login

Logs in an existing user.

**Request Format:** /login

**Request Type:** POST

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** Status 200 OK, Body: {"message": "Login successful!", "username": "string"}

## Get Login

Checks if a user is currently logged in.

**Request Format:** /check-login

**Request Type:** GET

**Response:** Status 200 OK, Body: {"isLoggedIn": boolean, "username": "string"}

## Log out

Logs out the current user.

**Request Format:** /logout

**Request Type:** POST

**Request Body:**
```json
{
  "username": "string"
}
```

**Response:** Status 200 OK, Body: {"message": "Logout successful!"}

## Email retrievement

Retrieves the current email of user.

**Request Format:** /grab-email

**Request Type:** GET

**Response:** Status 200 OK
```json
{"email": "string"}
```




## View User Enrollment History
**Request Format:** `/user/{userId}/history`

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Fetches the enrollment history for a given user, including course details and enrollment dates

**Example Request:** `GET /user/12345/history`

**Example Response:**

```json
{
  "userId": "12345",
  "enrollments": [
    {
      "courseId": "PY101",
      "name": "Python I",
      "term": "Autumn"
      "year": 2024,
      "confirmation number": "123921AJFI",
    }
  ]
}
```

**Error Handling:**
If the user has no enrollment history:
```json
{
  "error": "No enrollment history found for user 12345."
}
```

If user is not logged in:
```json
{
  "error": "Please log in to view enrollment history."
}

## Search and Filter Courses
**Request Format:** `/courses/search`

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Allows users to search for courses by keyword and apply filters (e.g., by category, instructor, date, or credit)

**Example Request:** `GET /courses/search?query=Python&category=Programming&credit=3`

**Example Response:**

```json
[
  {
    "courseId": "PY201",
    "name": "Python II",
    "category": "Programming",
    "instructor": "Jane Doe",
    "duration": "4 weeks",
    "credits": 3,
    "time": "3:00PM"
  }
]
```

**Error Handling:**
If no courses found via the search criteria:
```json
{
  "error": "No courses found matching the criteria."
}
```

## Preview Course Content
**Request Format:** `/courses/{courseId}/preview`

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Provides a preview of the course content, including a syllabus or topics covered in the course

**Example Request:** `GET /courses/PY101/preview`

**Example Response:**

```json
{
  "courseId": "PY101",
  "preview": [
    "Introduction to Python programming",
    "Variables and data types",
    "Control structures: loops and conditionals",
    "Functions and modules",
    "Basic file handling"
  ]
}
```

**Error Handling:**
If the course doesn't exist:
```json
{
  "error": "Course not found."
}
```

## View Instructor Profile and Courses
**Request Format:** `/instructors/{instructorId}`

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Provides details about an instructor, including their bio, qualifications, and the courses they teach

**Example Request:** `GET /instructors/1`

**Example Response:**

```json
{
  "instructorId": "1",
  "name": "John Doe",
  "bio": "Senior Developer with 10 years of experience in Python and Java programming.",
  "courses": [
    {
      "courseId": "PY101",
      "name": "Python I"
    },
    {
      "courseId": "JAVA301",
      "name": "Java III"
    }
  ],
  "email": "johndoe1@university.edu"
}
```

**Error Handling:**
If the instructor ID doesn't exist:
```json
{
  "error": "Instructor not found."
}
```

## Manage Cart
**Request Format:** `/cart`

**Request Type:** POST / GET / DELETE

**Returned Data Format**: JSON

**Description:** Manages the user’s cart for course enrollment, allowing users to add, view, or remove courses

#### Add to Cart

**Example Request:** `POST /cart`

```json
{
  "userId": "12345",
  "courseId": "PY101"
}
```

**Example Response:**

```json
{
  "userId": "12345",
  "courseId": "PY101"
}
```

#### View Cart

**Example Request:** `GET /cart?userId=12345`

**Example Response:**

```json
{
  "userId": "12345",
  "cart": [
    {
      "courseId": "PY101",
      "name": "Python I"
    },
    {
      "courseId": "JAVA201",
      "name": "Java II"
    }
  ]
}
```

#### Remove from Cart

**Example Request:** `DELETE /cart`

**Example Response:**

```json
{
  "userId": "12345",
  "courseId": "PY101"
}
```

**Error Handling:**
If the course to-be-removed isn't in the cart
```json
{
  "error": "Course does not exist in cart"
}
```

```json
If cart is empty:
{
  "error": "No courses in cart"
}
```

## Get majors

Retrieves all available majors.

**Request Format:** /available-majors

**Request Type:** GET

```json
{
  "Computer Science",
  "Informatics",
  "AI"
}
```

Failure: Server code 500

### Update majors

Updates the users major.

**Request Format:** /update-major/user/major

**Request Type:** PUT

**Success:** Major updated successfully.

**Failure:** No user: Login is required.
No major: Major selection is required.

/*
 * Names: Mason Howes, Eugene Cheung
 * Date: December 10th, 2024
 * Section: CSE 154 AD
 *
 * This is the index javascript file that handles the main course enrollment portion of the
 * website. It populates the existing courses, lets the user search and filter said courses,
 * and also lets them add classes to their cart. It also allows them to log in, access the
 * quick-access hamburger menu, and redirect to each portion of the webpage.
 */

"use strict";
(function() {

  let courses = [];

  window.addEventListener("load", init);

  /**
   * Initializes the event listeners and sets up the page.
   */
  function init() {
    setupProfileListeners();
    setupSearchListeners();
    setupLoginListeners();
    updateLoginUI();
    loadCourses();
    setupMenuListeners();
    fetchMajors();
    setupFilterListeners();
    updateCartDisplay();
  }

  /**
   * Sets up listeners for the filter-related UI components and initializes default values.
   */
  function setupFilterListeners() {
    id("time-range-end").value = "7:00PM";
    setupCreditRangeListener();
    setupMajorFilterListener();
    setupTimeRangeListeners();
  }

  /**
   * Fetches available majors from the server and populates the major filter dropdown.
   * @async
   * @throws {Error} Logs error if fetch request fails.
   */
  async function fetchMajors() {
    try {
      let response = await fetch('/available-majors');
      if (!response.ok) {
        return;
      }
      let data = await response.json();
      if (data.majors) {
        populateMajorFilter(data.majors);
      } else {
      }
    } catch (error) {
      console.error("Couldn't fetch major information", error);
    }
  }

  /**
   * Fetches course data from the server and renders it on the page.
   * @async
   * @throws {Error} If the fetch request fails or the response is not ok.
   */
  async function loadCourses() {
    try {
      let response = await fetch("/courses");
      if (!response.ok) {
        throw new Error("Failed to load courses.");
      }
      let data = await response.json();
      courses = data.courses;
      renderCourses(courses);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  }

  /**
  * Renders the course data into the DOM.
  * @param {Array} courses - An array of course objects to be rendered.
  */
  async function renderCourses(courses) {
    id("course-container").innerHTML = "";
    let userHistory = await userCourseHistory();
    let loggedIn = await isLoggedIn();
    let cartItems = await getCartItems();
    courses.forEach(course => {
      buildCard(course, userHistory, loggedIn, cartItems);
    });
    setupDetailsListeners(courses);
    setupBookmarkListeners();
  }

  /**
   * Builds a course card for each course and appends it to the course container.
   * @async
   * @param {Object} course - The course object containing its details.
   * @param {Array} userHistory - List of courses previously taken by the user.
   * @param {boolean} loggedIn - Indicates if the user is logged in.
   * @param {Array} cartItems - List of courses in the user's cart.
   */
  async function buildCard(course, userHistory, loggedIn, cartItems) {
    let courseCard = gen("div");
    courseCard.classList.add("course-card");
    courseCard.id = `${course.course_id}-cc`;
    let header = gen("h3");
    header.textContent = `${course.course_id}: ${course.name}`;
    courseCard.appendChild(header);
    let description = gen("p");
    description.textContent = `${course.description || "No description available"}`;
    courseCard.appendChild(description);
    let category = gen("p");
    category.innerHTML = `<strong>Category:</strong> ${course.category}`;
    courseCard.appendChild(category);
    let credits = gen("p");
    credits.innerHTML = `<strong>Credits:</strong> ${course.credits || 'N/A'}`;
    courseCard.appendChild(credits);
    let duration = gen("p");
    duration.innerHTML = `<strong>Duration:</strong> ${course.duration || 'N/A'}`;
    courseCard.appendChild(duration);
    let time = gen("p");
    time.innerHTML = `<strong>Time:</strong> ${course.time || 'N/A'}`;
    courseCard.appendChild(time);
    buildActionBar(courseCard, course, userHistory, loggedIn, cartItems);
    id("course-container").appendChild(courseCard);
  }

  /**
   * Builds the action bar containing buttons for course actions (e.g., details, bookmarks).
   * @async
   * @param {HTMLElement} courseCard - The parent course card element.
   * @param {Object} course - The course object.
   * @param {Array} userHistory - List of courses previously taken by the user.
   * @param {boolean} loggedIn - Indicates if the user is logged in.
   * @param {Array} cartItems - List of courses in the user's cart.
   */
  async function buildActionBar(courseCard, course, userHistory, loggedIn, cartItems) {
    let courseTaken = checkIfTaken(userHistory, course);
    let div = gen("div");
    div.id = "action-bar";
    let detailsButton = gen("button");
    detailsButton.classList.add("details-btn");
    detailsButton.setAttribute("data-id", `${course.course_id}`);
    detailsButton.textContent = "More Details";
    let bookmarkButton = gen("button");
    bookmarkButton.classList.add("bookmark-btn");
    bookmarkButton.setAttribute("data-id", `${course.course_id}`);
    bookmarkButton.disabled = courseTaken || !loggedIn;
    bookmarkButton.id = `${course.course_id}-btn`;
    let bookmark = gen("img");
    imgInit(bookmark, bookmarkButton, courseTaken, cartItems, course.course_id);
    bookmarkButton.appendChild(bookmark);
    div.appendChild(detailsButton);
    div.appendChild(bookmarkButton);
    courseCard.appendChild(div);
  }

  /**
   * Initializes the bookmark button based on the course status (taken or in cart).
   * @param {HTMLImageElement} bookmark - The image element for the bookmark icon.
   * @param {HTMLElement} bookmarkButton - The bookmark button element.
   * @param {boolean} courseTaken - Indicates if the course has been taken.
   * @param {Array} cartItems - List of courses in the user's cart.
   * @param {string} course - The course ID.
   */
  function imgInit(bookmark, bookmarkButton, courseTaken, cartItems, course) {
    if (courseTaken) {
      bookmark.src = "img/complete.svg";
      bookmark.alt = "Completed Course";
      bookmarkButton.title = "Course Completed";
      bookmarkButton.classList.remove("bookmarkable");
      bookmarkButton.classList.add("unbookmarkable");
    } else if (cartItems && cartItems.find(c => c.course_id === course)) {
      bookmark.src = "img/remove-bookmark.svg";
      bookmark.alt = "Remove Course from Cart";
      bookmarkButton.title = "Remove Course";
    } else {
      bookmark.src = "img/add-bookmark.svg";
      bookmark.alt = "Add Course to Cart";
      bookmarkButton.title = "Add Course";
      bookmarkButton.classList.add("bookmarkable");
    }
  }

  /**
   * Sets up event listeners for additional details, to be implemented.
   @param {Array} courses - An array of course objects to be rendered.
   */
  function setupDetailsListeners(courses) {
    document.querySelectorAll(".details-btn").forEach(button => {
      button.addEventListener("click", event => {
        let courseId = event.target.dataset.id;
        fillDetailsPage(courses, courseId);
      });
    });

    id("mcd-close-dd").addEventListener("click", () => {
      id("more-course-details").classList.add("hidden");
    })
  }

  /**
   * Populates the details card with specific course information
   * @param {Array} courses - An array of course objects to be rendered.
   */
  function fillDetailsPage(courses, courseId) {
    let course = courses.find(course => course.course_id === courseId);
    id("d-title").textContent = `${course.course_id} - ${course.name}`;
    id("d-major").textContent = `Major: ${course.major}`;
    id("d-professor").textContent = `Professor: ${course.instructor_id}`;
    id("d-duration").textContent = `Duration: ${course.duration}`;
    id("d-credits").textContent = `Credits: ${course.credits}`;
    id("d-prereqs").textContent = `Prerequisites: ${course.prerequisites}`;
    id("d-time").textContent = `Time: ${course.time}`;
    id("d-description").textContent = `Description: ${course.description}`;
    id("d-seats").textContent = `Seats available: ${course.available_seats}`;
    id("more-course-details").classList.remove("hidden");
  }

  /**
   * Sets up event listeners for all bookmark buttons on the page.
   */
  function setupBookmarkListeners() {
    let bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    bookmarkButtons.forEach(button => {
      button = clearEventListeners(button);
      button.addEventListener('click', () => {
        handleBookmarkToggle(button);
      });
    });
  }

  /**
   * Toggles the bookmark state of a course by handling its addition or removal.
   * @async
   * @param {HTMLElement} button - The button element representing the bookmark action.
   */
  async function handleBookmarkToggle(button) {
    let img = button.querySelector("img");
    if (img.src.includes("add-bookmark")) {
      await allowAddToCart(button, img);
    } else if (img.src.includes("remove-bookmark")) {
      await allowRemoveFromCart(button, img);
    }
  }

  /**
   * Allows a user to add a course to their cart and updates the button state.
   * @async
   * @param {HTMLElement} button - The button element representing the add-to-cart action.
   * @param {HTMLImageElement} img - The image element representing the bookmark state.
   */
  async function allowAddToCart(button, img) {
    if (!isLoggedIn()) {
      //('Please log in to bookmark classes.');
      return;
    }
    let courseId = button.dataset.id;
    try {
      let response = await fetch('/add-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });
      if (response.ok) {
        img.src = "img/remove-bookmark.svg";
        img.title = "Remove Course";
        updateCartDisplay();
      } else {
        console.error("Failed to add course to cart");
      }
    } catch (error) {
      console.error('Error adding course to cart:', error);
    }
  }

  /**
   * Allows a user to remove a course from their cart and updates the button state.
   * @async
   * @param {HTMLElement} button - The button element representing the remove-from-cart action.
   * @param {HTMLImageElement} img - The image element representing the bookmark state.
   */
  async function allowRemoveFromCart(button, img) {
    let courseId = button.dataset.id;
    try {
      let response = await fetch('/remove-from-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });
      if (response.ok) {
        img.src = "img/add-bookmark.svg";
        img.title = "Add Course";
        updateCartDisplay();
      } else {
        console.error("Failed to remove course from cart");
      }
    } catch (error) {
      console.error('Error removing course from cart:', error);
    }
  }

  /**
   * Fetches the user's course history from the server.
   * @async
   * @returns {Array|boolean} The user's course history if logged in, otherwise false.
   * @throws {Error} Logs error if fetch request fails.
   */
  async function userCourseHistory() {
    if (!isLoggedIn()) {
      return false;
    }
    try {
      let response = await fetch('/course-history');
      if (!response.ok) {
        throw new Error("Failed to fetch user course history");
      }
      let data = await(response.json());
      return data.courses;
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks if a user has previously taken a specific course.
   * @param {Array} history - The user's course history.
   * @param {Object} course - The course to check.
   * @returns {boolean} True if the course has been taken, otherwise false.
   */
  function checkIfTaken(history, course) {
    if (!history) {
      return false;
    }
    let hasTaken = history.find(c => c.course_id === course.course_id);
    if (hasTaken) {
      return true;
    }
    return false;
  }

  /**
   * Updates the cart display by fetching current cart items and rendering them.
   * @async
   * @throws {Error} Logs error if fetch request fails.
   */
  async function updateCartDisplay() {
    try {
      let response = await fetch('/get-cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      let data = await response.json();
      let saveContainer = id('save-container');
      saveContainer.replaceChildren();
      if (data.cart.length === 0) {
        defaultBmMenu();
      } else {
        data.cart.forEach(item => {
          buildSavedCourses(item);
        });
      }
    } catch (error) {
      console.error('Error updating cart display:', error);
    }
  }

  /**
   * Resets the saved courses menu to its default state when no items are in the cart.
   */
  function defaultBmMenu() {
    let defaultText = gen("p");
    defaultText.textContent = "Save courses to enroll!";
    id("save-container").appendChild(defaultText);
  }

  /**
 * Builds and appends an element for a saved course to the cart display.
 * @param {Object} item - The course object to render in the saved courses section.
 */
  function buildSavedCourses(item) {
    let courseElement = gen('article');
    courseElement.classList.add('saved-course');
    courseElement.title = "Remove Course";
    let courseName = gen("p");
    courseName.textContent = `${item.course_id}: ${item.name}`;
    courseElement.appendChild(courseName);
    courseElement.dataset.courseId = item.course_id;
    courseElement.addEventListener('click', removeCourseFromCart);
    id("save-container").appendChild(courseElement);
  }

  /**
   * Retrieves the current cart items from the server.
   * @async
   * @returns {Array} The list of courses in the user's cart.
   * @throws {Error} Logs error if fetch request fails.
   */
  async function getCartItems() {
    try {
      let response = await fetch('/get-cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      let data = await response.json();
      return data.cart;
    } catch (error) {
      console.error('Error updating cart display:', error);
    }
  }
  
  /**
   * Removes a course from the user's cart and updates the cart display.
   * @async
   * @param {Event} event - The event object from the click handler.
   * @throws {Error} Logs error if fetch request fails.
   */
  async function removeCourseFromCart(event) {
    let courseId = event.target.dataset.courseId;
    let correspondingBm = id(`${courseId}-btn`);
    let bmImg = correspondingBm.querySelector("img");
    try {
      let response = await fetch('/remove-from-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });
      if (response.ok) {
        bmImg.src = "img/add-bookmark.svg";
        bmImg.title = "Add Course";
        updateCartDisplay();
      } else {
        console.error('Failed to remove course from cart');
      }
    } catch (error) {
      console.error('Error removing course from cart:', error);
    }
  }

  /**
   * Checks if the user is logged in.
   * @async
   * @returns {Promise<boolean>} - `true` if the user is logged in, otherwise `false`.
   */
  async function isLoggedIn() {
    try {
      let response = await fetch("/check-login");
      if (!response.ok) {
        throw new Error("Failed to check login status");
      }
      let data = await response.json();
      return data.isLoggedIn;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }

  /**
   * Sets up event listeners for profile and dropdown actions.
   */
  function setupProfileListeners() {
    id("profile").addEventListener("click", toggleProfileDropdown);
    id("close-dd").addEventListener("click", closeProfileDd);
    id("logged-in-pfp").addEventListener("click", () => {
      id("lo-drop-down").classList.toggle("hidden");
    });
    id("lo-close-dd").addEventListener("click", () => {
      id("lo-drop-down").classList.toggle("hidden");
    });
  }

  /**
   * Sets up event listeners for the search form submission.
   */
  function setupSearchListeners() {
    const searchForm = id("course-form");
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const searchQuery = id("course-search").value.trim().toLowerCase();
      filterCourses(searchQuery);
    });
  }

  /**
   * Sets up event listener for handling login.
   */
  function setupLoginListeners() {
    id("login-button").addEventListener("click", async () => {
      let username = id("username").value.trim();
      let password = id("password").value.trim();

      if (!username || !password) {
        return;
      }
      try {
        let response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, password })
        });
        let data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed.");
        }

        localStorage.setItem("currentUser", username);
        window.location.reload();

      } catch (error) {
        return;
      }
    });
  }

  /**
   * Updates the UI based on the user's login status.
   * @async
   */
  async function updateLoginUI() {
    const currentUser = localStorage.getItem("currentUser");

    if (currentUser) {
      id("signin-reminder").classList.add("hidden");
      id("drop-down").classList.add("swapped");
      id("logout-button").addEventListener("click", logoutUser);
      let email = await fetchCurrentEmail();
      id("welcome-prompt").textContent = email;
      fillProfileCircle(currentUser);
      id("user-sm").textContent = `Hello, ${currentUser}!`;
    } else {
      id("signin-reminder").classList.remove("hidden");
      id("lo-drop-down").classList.add("hidden");
      id("drop-down").classList.remove("swapped");
      id("logged-in-pfp").classList.add("hidden");
      id("profile").classList.remove("hidden");
    }
  }

  /**
   * Fetches the current user's email.
   * @async
   * @returns {Promise<string>} - The user's email or an error message.
   */
  async function fetchCurrentEmail() {
    try {
      let response = await fetch("/grab-email");
      if (!response.ok) {
        return;
      }
      let data = await response.json();

      if (data.message.email) {
        return data.message.email;
      } else {
        return "Error fetching email 2";
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      return "Error fetching email";
    }
  }

  /**
   * Logs out the current user and refreshes the page.
   * @async
   */
  async function logoutUser() {
    let currentUser = localStorage.getItem("currentUser");
    try {
      let response = await fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: currentUser })
      });

      let data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Logout failed.");
      }

      localStorage.removeItem("currentUser");
      window.location.reload();
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }

  /**
   * Populates the profile circle with the user's initials.
   * @param {string} currentUser - The username of the logged-in user.
   */
  function fillProfileCircle(currentUser) {
    id("pfp-letter").textContent = currentUser.charAt(0).toUpperCase();
    id("pfp-letter-sm").textContent = currentUser.charAt(0).toUpperCase();
    id("logged-in-pfp").classList.remove("hidden");
    id("profile").classList.add("hidden");
  }

  /**
   * Sets up event listeners for opening and closing the hamburger & save menus.
   */
  function setupMenuListeners() {
    id("hbm").addEventListener("click", openMenu);
    id("close-hbm").addEventListener("click", closeMenu);
    setupHBMButtons();

    id("archive").addEventListener("click", openSaved);
    id("close-save").addEventListener("click", closeSaved);
    id("filter").addEventListener("click", openFilterMenu);
    id("close-fm").addEventListener("click", openFilterMenu);

    id("to-checkout").addEventListener("click", () => {
      window.location.href = "checkout.html";
    })
  }

  /**
   * Sets up event listeners for category and option selection.
   */
  function setupCreditRangeListener() {
    const creditRange = id('credit-range');
    const creditValue = id('credit-value');
    creditValue.textContent = creditRange.value;
    creditRange.addEventListener('input', () => {
      creditValue.textContent = creditRange.value;
      filterCourses(id("course-search").value.trim().toLowerCase());
    });
  }

  /**
   * Retrieves the selected credit value from the credit range input.
   * @returns {number} - The selected credit value.
   */
  function getSelectedCredits() {
    return parseInt(id('credit-range').value, 10);
  }

  /**
   * Sets up event listeners for handling time range changes.
   */
  function setupTimeRangeListeners() {
    const timeRangeStart = id('time-range-start');
    const timeRangeEnd = id('time-range-end');
  
    timeRangeStart.addEventListener('input', () => filterCourses(id("course-search").value.trim().toLowerCase()));
    timeRangeEnd.addEventListener('input', () => filterCourses(id("course-search").value.trim().toLowerCase()));
  }

  /**
   * Toggles the profile dropdown visibility.
   * @param {Event} event - The event object.
   */
  function toggleProfileDropdown(event) {
    id("drop-down").classList.toggle("hidden");
    event.target.classList.toggle("selected");
  }

  /**
   * Toggles the profile dropdown visibility on X click.
   */
  function closeProfileDd() {
    id("drop-down").classList.toggle("hidden");
    id("profile").classList.remove("selected");
  }

  /**
   * Opens the hamburger menu.
   */
  function openMenu() {
    let menu = id("hamburger-menu");
    menu.classList.remove("hbm-exit");
    menu.classList.add("hbm-enter");
  }

  /**
   * Closes the hamburger menu.
   */
  function closeMenu() {
    let menu = id("hamburger-menu");
    menu.classList.toggle("hbm-enter");
    menu.classList.toggle("hbm-exit");
  }

  /**
   * Sets up event listeners for HBM buttons to navigate to different pages.
   */
  function setupHBMButtons() {
    id("view-mm").addEventListener("click", () => {
      window.location.href = "degree-information.html";
    })
    id("checkout").addEventListener("click", () => {
      window.location.href = "checkout.html";
    })
    id("view-ch").addEventListener("click", () => {
      window.location.href = "course-history.html";
    })
  }

  /**
   * Opens the saved courses menu.
   * @param {Event} event - The event object.
   */
  function openSaved(event) {
    let menu = id("save-dd");
    menu.classList.toggle("hidden");
    event.target.classList.toggle("selected");
  }

  /**
   * Opens the filter menu.
   */
  function openFilterMenu(event) {
    let filterSection = id("filter-section");
    filterSection.classList.remove("invisible");
    let classes = id("course-container");
    event.target.classList.toggle("selected");

    if (filterSection.classList.contains("fm-enter")) {
      filterSection.classList.remove("fm-enter");
      filterSection.classList.add("fm-exit");

      classes.classList.remove("cl-update-enter");
      classes.classList.add("cl-update-exit");
      id("filter").classList.remove("selected");
      id("close-fm").classList.remove("selected");
    } else {
      filterSection.classList.remove("fm-exit");
      filterSection.classList.add("fm-enter");

      classes.classList.remove("cl-update-exit");
      classes.classList.add("cl-update-enter");
    }
  }

  /**
   * Filters courses based on time, credits, major, and search query.
   * @param {string} searchQuery - The search input provided by the user.
   */
  function filterCourses(searchQuery = "") {
    const selectedTimeRange = getSelectedTimeRange();
    const selectedCredits = getSelectedCredits();
    const selectedMajor = getSelectedMajor();

    const filteredCourses = courses.filter(course => {
      const timeMatch = isTimeInRange(course.time, selectedTimeRange.start, selectedTimeRange.end);
      const creditMatch = isCreditInRange(course.credits, selectedCredits);
      const majorMatch = selectedMajor === 'all' || course.major === selectedMajor;
      const searchMatch = searchQuery === "" || course.course_id.toLowerCase().includes(searchQuery.toLowerCase()) || course.name.toLowerCase().includes(searchQuery.toLowerCase());

      return timeMatch && creditMatch && majorMatch && searchMatch;
    });

    renderCourses(filteredCourses);
  }

  /**
   * Populates the major filter dropdown with available majors.
   * @param {Array} majors - List of majors.
   */
  function populateMajorFilter(majors) {
    const majorSelect = id('major-select');
    majors.forEach(major => {
      let option = gen('option');
      option.value = major.degree_name;
      option.textContent = major.degree_name;
      majorSelect.appendChild(option);
    });
  }

  /**
   * Retrieves the selected time range from the UI.
   * @returns {Object} - An object containing the start and end times.
   */
  function getSelectedTimeRange() {
    const start = id('time-range-start').value;
    const end = id('time-range-end').value;
    return { start, end };
  }

  /**
   * Sets up the event listener for the major filter dropdown.
   */
  function setupMajorFilterListener() {
    const majorSelect = id('major-select');
    let filterVal = id("course-search").value.trim().toLowerCase();
    majorSelect.addEventListener('change', () => filterCourses(filterVal));
  }

  /**
   * Retrieves the currently selected major from the filter dropdown.
   * @returns {string} - The value of the selected major.
   */
  function getSelectedMajor() {
    return id('major-select').value;
  }

  /**
   * Checks if a course's time falls within the selected range.
   * @param {string} courseTime - The time of the course.
   * @param {string} start - The start time of the range.
   * @param {string} end - The end time of the range.
   * @returns {boolean} - `true` if within range, otherwise `false`.
   */
  function isTimeInRange(courseTime, start, end) {
    if (!start || !end || !courseTime) {
      return true;
    }
    const courseMinutes = convertTimeToMinutes(courseTime);
    const startMinutes = convertTimeToMinutes(start);
    const endMinutes = convertTimeToMinutes(end);

    if (endMinutes < startMinutes) {
      return courseMinutes >= startMinutes || courseMinutes <= endMinutes;
    }

    return courseMinutes >= startMinutes && courseMinutes <= endMinutes;
  }

  /**
   * Checks if a course's credits are within the selected range.
   * @param {number} courseCredits - The credits of the course.
   * @param {number} selectedCredits - The selected credit range.
   * @returns {boolean} - `true` if within range, otherwise `false`.
   */
  function isCreditInRange(courseCredits, selectedCredits) {
    const result = courseCredits <= selectedCredits;
    return result;
  }

  /**
   * Converts a time string (e.g., "3:00 PM") to total minutes.
   * @param {string} time - The time string to convert.
   * @returns {number} - Total minutes since midnight.
   */
  function convertTimeToMinutes(time) {
    const T_PERIOD = 12;
    const HOUR = 60;
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (period === 'PM' && hours !== T_PERIOD) {
      hours += T_PERIOD;
    } else if (period === 'AM' && hours === T_PERIOD) {
      hours = 0;
    }

    return hours * HOUR + (minutes || 0);
  }

  /**
   * Closes the saved courses menu.
   */
  function closeSaved() {
    let menu = id("save-dd");
    menu.classList.toggle("hidden");
    id("archive").classList.toggle("selected");
  }

  /**
   * Gets an element by its ID.
   * @param {string} idName - The ID of the element.
   * @return {HTMLElement} The element with the specified ID.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Generates a new DOM element of the specified type.
   * @param {string} element - The type of element to create (e.g., "div", "span").
   * @returns {HTMLElement} - The newly created element.
   */
  function gen(element) {
    return document.createElement(element);
  }

  /**
   * Clears all event listeners on a DOM element by replacing it with a clone.
   * @param {HTMLElement} element - The element whose listeners should be cleared.
   * @returns {HTMLElement} - The cloned element with listeners removed.
   */
  function clearEventListeners(element) {
    let clonedElement = element.cloneNode(true);
    element.parentNode.replaceChild(clonedElement, element);
    return clonedElement;
  }
})();

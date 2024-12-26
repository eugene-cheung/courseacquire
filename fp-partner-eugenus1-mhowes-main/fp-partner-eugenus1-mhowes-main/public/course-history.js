/*
 * Names: Mason Howes, Eugene Cheung
 * Date: December 10th, 2024
 * Section: CSE 154 AD
 *
 * This is the course history javascript file. This accesses the user's existing course history
 * and generates a comprehensive list of said courses. It also provides an indication of whether
 * or not the course fulfills and major or minor requirements. It also lists what time of year
 * the course was taken.
 */

"use strict";

(function() {

  window.addEventListener("load", init);

  /**
   * Initializes the application by setting up event listeners, updating the UI, and fetching
   * user data.
   */
  function init() {
    setupProfileListeners();
    setupLoginListeners();
    updateLoginUI();
    setupMenuListeners();
    setupEventListeners();
    getUserHistory();
  }

  /**
   * Sets up event listeners for the "return home" button.
   */
  function setupEventListeners() {
    id("return-home").addEventListener("click", () => {
        window.location.href = "index.html";
    })
  }

  /**
   * Fetches the course history for the current user and populates the UI with the data.
   * Logs an error message if fetching fails.
   * @async
   */
  async function getUserHistory() {
    try {
      let response = await fetch('/course-history');
      if (!response.ok) {
        return;
      }
      let data = await response.json();
      listData(data);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  /**
   * Processes and displays a list of course history data.
   * Replaces existing content in the UI with the updated course cards.
   * @async
   * @param {Object} data - The data containing the courses.
   */
  async function listData(data) {
    let courses = data.courses;
    if (courses.length !== 0) {
      id("classes-list").replaceChildren();
      id("button-container").replaceChildren();
      courses.forEach(course => {
        buildCard(course);
      })
    }
  }

  /**
   * Builds and appends a course card to the course history list in the UI.
   * @async
   * @param {Object} course - The course data.
   */
  async function buildCard(course) {
    let baseCard = gen("section");
    baseCard.classList.add("ch-card-style");
    baseCard.id = course.course_id;

    let header = gen("article");
    header.classList.add("ch-card-header");
    let courseId = gen("p");
    courseId.textContent = `${course.course_id}: ${course.name}`;
    header.appendChild(courseId);

    let content = gen("article");
    content.classList.add("ch-card-content");
    let credits = gen("p");
    credits.textContent = `Credits: ${course.credits}`;
    let duration = gen("p");
    duration.textContent = `Duration: ${course.duration}`;
    let ffsMajorCont = await majorReq(course);
    let ffsMinorCont = await minorReq(course);

    let confirmationNumber = gen("p");
    confirmationNumber.textContent = `Confirmation Number: ${course.confirmation_number}`;
    confirmationNumber.classList.add("confirmation-number");

    content.appendChild(credits);
    content.appendChild(duration);
    content.appendChild(confirmationNumber);
    content.appendChild(ffsMajorCont);
    content.appendChild(ffsMinorCont);

    baseCard.appendChild(header);
    baseCard.appendChild(content);

    let compDate = gen("p");
    compDate.textContent = `${course.term} ${course.year}`;
    compDate.classList.add("date-styling");
    id("classes-list").appendChild(compDate);

    id("classes-list").appendChild(baseCard);
  }

  /**
   * Creates and returns a UI section indicating if a course fulfills a major requirement.
   * @async
   * @param {Object} course - The course data.
   * @return {HTMLElement} The section element for major requirement fulfillment.
   */
  async function majorReq(course) {
    let ffsMajorCont = gen("section");
    let ffsMajorText = gen("p");
    ffsMajorText.textContent = "Fullfils Major Requirement: ";
    let ffsMajorImg = gen("img");
    ffsMajorImg.src = await fulfillCheck(course, "major");
    ffsMajorCont.appendChild(ffsMajorText);
    ffsMajorCont.appendChild(ffsMajorImg);
    ffsMajorCont.classList.add("degree-fulfillment");
    return ffsMajorCont;
  }

  /**
   * Creates and returns a UI section indicating if a course fulfills a minor requirement.
   * @async
   * @param {Object} course - The course data.
   * @return {HTMLElement} The section element for minor requirement fulfillment.
   */
  async function minorReq(course) {
    let ffsMinorCont = gen("section");
    let ffsMinorText = gen("p");
    ffsMinorText.textContent = "Fullfils Minor Requirement: ";
    let ffsMinorImg = gen("img");
    ffsMinorImg.src = await fulfillCheck(course, "minor");
    ffsMinorCont.appendChild(ffsMinorText);
    ffsMinorCont.appendChild(ffsMinorImg);
    ffsMinorCont.classList.add("degree-fulfillment");
    return ffsMinorCont;
  }

  /**
   * Checks if a course fulfills a specific degree requirement (major or minor).
   * Fetches degree data from the server.
   * @async
   * @param {Object} course - The course data.
   * @param {string} degree - The degree type ("major" or "minor").
   * @return {string} The path to the appropriate icon (complete or incomplete).
   */
  async function fulfillCheck(course, degree) {
    let endpoint;

    if (degree === "major") {
      endpoint = "/user-major-information";
    } else {
      endpoint = "/user-minor-information";
    }
    try {
      let response = await fetch(endpoint);
      if (!response.ok) {
        return;
      }
      let data = await response.json();
      if (data.major) {
        return degreeReq(course, data.major, "major");
      } else if (data.minor) {
        return degreeReq(course, data.minor, "minor");
      } else {
        return "Error fetching degree information";
      }
    } catch (error) {
      console.error(error);
      return "img/pending.svg";
    }
  }

  /**
   * Determines the appropriate icon for a course's degree requirement fulfillment.
   * @param {Object} course - The course data.
   * @param {string} degree - The degree name.
   * @param {string} degreeType - The degree type ("major" or "minor").
   * @return {string} The path to the appropriate icon (complete or incomplete).
   */
  function degreeReq(course, degree, degreeType) {
    if (degreeType === "major" && degree === course.major) {
      return "img/complete.svg";
    } else if (degreeType === "minor" && degree === course.minor) {
      return "img/complete.svg";
    }
    return "img/incomplete.svg";
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
        console.error(`Error: ${error.message}`);
      }
    });
  }

  /**
   * Updates the login UI based on the current user's login status.
   * Displays the user profile if logged in, or login prompts if not.
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
   * Fetches the current user's email address from the server.
   * Returns an error message if the fetch fails.
   * @async
   * @return {string} The email address or an error message.
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
   * Logs out the current user by sending a request to the server.
   * Clears localStorage and reloads the page upon successful logout.
   * Displays an error message if the logout fails.
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
   * Fills the profile circle with the user's initial and updates visibility of profile-related
   * elements.
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
   * Opens the hamburger menu by transitioning its visibility and state.
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
})();
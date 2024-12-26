/*
 * Names: Mason Howes, Eugene Cheung
 * Date: December 10th, 2024
 * Section: CSE 154 AD
 *
 * This is the degree information javascript file. This allows the user to audit their major and
 * minor and figure out which courses they need to complete to fulfill their degree. It also lets
 * them change what major or minor their account is tied to.
 */

"use strict";

(function() {

  window.addEventListener("load", init);

  const USERNAME = localStorage.getItem('currentUser');

  /**
   * Initializes the page by setting up event listeners and populating initial UI elements.
   */
  function init() {
    changePageTitle();
    setupPageListeners();
    updateLoggedInUI();
    setupLoginListeners();
    populateMajorInformation();
    setupMenuListeners();
  }

  /**
   * Updates the page title based on the logged-in user.
   */
  function changePageTitle() {
    if (USERNAME) {
      document.title = `${USERNAME}'s Degree - CourseAcquire`;
    } else {
      document.title = "Degree Information - CourseAcquire";
    }
  }

  /**
   * Determines whether to populate major or minor information and updates the UI accordingly.
   */
  function determinePopulation() {
    if (id("major-minor-select").value === "major") {
      id("change-degree").textContent = "Change Major";
      populateMajorInformation();
    } else {
      id("change-degree").textContent = "Change Minor";
      populateMinorInformation();
    }
  }

  /**
   * Sets up event listeners for page actions.
   */
  function setupPageListeners() {
    id("major-minor-select").value = "major";
    id("profile").addEventListener("click", toggleProfileDropdown);
    id("close-dd").addEventListener("click", closeProfileDd);
    id("major-minor-select").addEventListener("change", determinePopulation);
    id("change-degree").addEventListener("click", () => {
      id("change-major-container").classList.toggle("hidden");
    })
    id("close-cm").addEventListener("click", () => {
      id("change-major-container").classList.toggle("hidden");
    });
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
   * Toggles the major change visibility on X click.
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
   * Updates the UI elements based on the logged-in user status.
   * @async
   */
  async function updateLoggedInUI() {
    if (USERNAME) {
      id("signin-reminder").classList.add("hidden");
      id("drop-down").classList.add("swapped");
      id("logout-button").addEventListener("click", logoutUser);
      let email = await fetchCurrentEmail();
      id("welcome-prompt").textContent = email;
      fillProfileCircle(USERNAME);
      id("user-sm").textContent = `Hello, ${USERNAME}!`;
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
   * @async
   * @return {string} The email address of the current user or an error message.
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
      return "Error fetching email";
    }
  }

  /**
   * Logs out the current user by sending a request to the server and clearing local storage.
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
   * Fetches and populates major-related information for the logged-in user.
   * @async
   */
  async function populateMajorInformation() {
    try {
      let response = await fetch("/user-major-information");
      if (!response.ok) {
        return;
      }
      let data = await response.json();
      if (data.major && data.majorCourses) {
        fillMajorContent(data.major, data.majorCourses);
      } else {
        return "Error fetching major information";
      }
    } catch (error) {
      console.error("Couldn't fetch major information");
      return;
    }
  }

  /**
   * Fetches and populates minor-related information for the logged-in user.
   * @async
   */
  async function populateMinorInformation() {
    try {
      let response = await fetch("/user-minor-information");
      if (!response.ok) {
        return;
      }
      let data = await response.json();
      if (data.minor && data.minorCourses) {
        fillMinorContent(data.minor, data.minorCourses);
      } else {
        return "Error fetching minor information";
      }
    } catch (error) {
      console.error("Couldn't fetch minor information");
      return;
    }
  }

  /**
   * Populates the UI with major-related data and adds event listeners for major functionality.
   * @param {string} major - The name of the major.
   * @param {Array<Object>} majorCourses - An array of course objects related to the major.
   */
  function fillMajorContent(major, majorCourses) {
    id("selected-degree").textContent = major;
    populateChangeMajorSelectors();
    id("cm-major").textContent = "Current Major: " + major;
    let runAuditBtn = id("run-degree-audit");
    runAuditBtn = clearEventListeners(runAuditBtn);
    runAuditBtn.addEventListener("click", () => {
      id("audit-information").replaceChildren();
      populateMajorCourses(majorCourses)
    });
    changeMajorFunctionality(major);
  }

  /**
   * Populates the UI with minor-related data and adds event listeners for minor functionality.
   * @param {string} minor - The name of the minor.
   * @param {Array<Object>} minorCourses - An array of course objects related to the minor.
   */
  function fillMinorContent(minor, minorCourses) {
    id("selected-degree").textContent = minor;
    populateChangeMinorSelectors();
    id("cm-major").textContent = "Current Minor: " + minor;
    let runAuditBtn = id("run-degree-audit");
    runAuditBtn = clearEventListeners(runAuditBtn);
    runAuditBtn.addEventListener("click", () => {
      id("audit-information").replaceChildren();
      populateMinorCourses(minorCourses)
    });
    changeMinorFunctionality(minor);
  }

  /**
   * Clears event listeners on an element by replacing it with a clone.
   * @param {HTMLElement} element - The element whose listeners are to be cleared.
   * @return {HTMLElement} The cloned element with no event listeners.
   */
  function clearEventListeners(element) {
    let clonedElement = element.cloneNode(true);
    element.parentNode.replaceChild(clonedElement, element);
    return clonedElement;
  }

  /**
   * Populates the UI with course cards for major-related courses.
   * @async
   * @param {Array<Object>} majorCourses - An array of course objects related to the major.
   */
  async function populateMajorCourses(majorCourses) {
    let reqArt = gen("article");
    reqArt.id = "req-art";
    reqArt.innerHTML = "";
    id("audit-information").appendChild(reqArt);
    let reqCourses = gen("p");
    reqCourses.textContent = "Required Courses:";
    id("req-art").appendChild(reqCourses);

    let optionalArt = gen("article");
    optionalArt.id = "optional-art";
    optionalArt.innerHTML = "";
    id("audit-information").appendChild(optionalArt);
    let optionalCourses = gen("p");
    optionalCourses.textContent = "Optional Courses:";
    id("optional-art").appendChild(optionalCourses);

    let userCourses = await findCourseStatus();
    majorCourses.forEach(course => {
      buildCard(course, userCourses);
    });
  }

  /**
   * Populates the UI with course cards for minor-related courses.
   * @async
   * @param {Array<Object>} minorCourses - An array of course objects related to the minor.
   */
  async function populateMinorCourses(minorCourses) {
    let reqArt = gen("article");
    reqArt.id = "req-art";
    id("audit-information").appendChild(reqArt);
    let reqCourses = gen("p");
    reqCourses.textContent = "Required Courses:";
    id("req-art").appendChild(reqCourses);

    let optionalArt = gen("article");
    optionalArt.id = "optional-art";
    id("audit-information").appendChild(optionalArt);
    let optionalCourses = gen("p");
    optionalCourses.textContent = "Optional Courses:";
    id("optional-art").appendChild(optionalCourses);

    let userCourses = await findCourseStatus();
    minorCourses.forEach(course => {
      buildCard(course, userCourses);
    });
  }

  /**
   * Creates and adds a course card to the UI based on its completion status and requirements.
   * @async
   * @param {Object} course - The course object containing course data.
   * @param {Array<Object>} userCourses - An array of user courses to check completion status.
   */
  async function buildCard(course, userCourses) {
    let courseCard = gen("article");
    courseCard.classList.add("course-card-style");
    courseCard.id = course.course_id;

    let courseInfo = gen("section");
    courseInfo.classList.add("course-info-style");
    courseCard.appendChild(courseInfo);

    let courses = userCourses.courses;
    let foundCourse = courses.find(c => c.course_id === course.course_id);
    let courseProg = gen("img");

    if (foundCourse) {
      courseProg.src = "img/complete.svg";
      courseProg.alt = "Complete";
    } else {
      courseProg.src = "img/incomplete.svg";
      courseProg.alt = "Incomplete";
    }
    courseInfo.appendChild(courseProg);

    let courseName = gen("p");
    courseName.textContent = course.course_id;
    courseInfo.appendChild(courseName);

    if (course.is_required === 1) {
      id("req-art").appendChild(courseCard);
    } else {
      id("optional-art").appendChild(courseCard);
    }
  }

  /**
   * Populates the dropdown menu with available majors for the user to select.
   * @async
   */
  async function populateChangeMajorSelectors() {
    try {
      let response = await fetch("/available-majors")
      if (!response.ok) {
        return;
      }
      let data = await response.json();
      if (data.majors) {
        fillMajorSelectors(data.majors);
      } else {
        return "Error fetching majors";
      }
    } catch (error) {
      console.error("Couldn't fetch major information");
      return;
    }
  }

  /**
   * Populates the dropdown menu with available minors for the user to select.
   * @async
   */
  async function populateChangeMinorSelectors() {
    try {
      let response = await fetch("/available-minors")
      if (!response.ok) {
        return;
      }
      let data = await response.json();
      if (data.minors) {
        fillMinorSelectors(data.minors);
      } else {
        return "Error fetching minors";
      }
    } catch (error) {
      console.error("Couldn't fetch minor information");
      return;
    }
  }

  /**
   * Fills the dropdown with the list of majors.
   * @param {Array<Object>} majors - An array of major objects containing degree names.
   */
  function fillMajorSelectors(majors) {
    id("major-minor-switch").replaceChildren();

    id("cm-header-name").textContent = "Change Major";
    id("update-degree").textContent = "Confirm Major Change";
    majors.forEach((major) => {
      let option = gen("option");
      option.value = major.degree_name;
      option.textContent = major.degree_name;
      id("major-minor-switch").appendChild(option);
    });
  }

  /**
   * Fills the dropdown with the list of minors.
   * @param {Array<Object>} minors - An array of minor objects containing degree names.
   */
  function fillMinorSelectors(minors) {
    id("major-minor-switch").replaceChildren();

    id("cm-header-name").textContent = "Change Minor";
    id("update-degree").textContent = "Confirm Minor Change";
    minors.forEach((minor) => {
      let option = gen("option");
      option.value = minor.degree_name;
      option.textContent = minor.degree_name;
      id("major-minor-switch").appendChild(option);
    });
  }

  /**
   * Sets up the functionality for changing the major, enabling/disabling the confirm button as needed.
   * @param {string} major - The current major of the user.
   */
  function changeMajorFunctionality(major) {
    let changeBtn = id("update-degree");
    let selector = id("major-minor-switch");

    changeBtn = clearEventListeners(changeBtn);
    selector = clearEventListeners(selector);

    selector.addEventListener("change", () => {
      let selectedMajor = selector.value;
      if (selectedMajor !== "none" && selectedMajor !== major) {
        changeBtn.disabled = false;
      } else {
        changeBtn.disabled = true;
      }
    });

    changeBtn.addEventListener("click", changeUserMajor);
  }

  /**
   * Sets up the functionality for changing the minor, enabling/disabling the confirm button as needed.
   * @param {string} minor - The current minor of the user.
   */
  function changeMinorFunctionality(minor) {
    let changeBtn = id("update-degree");
    let selector = id("major-minor-switch");

    changeBtn = clearEventListeners(changeBtn);
    selector = clearEventListeners(selector);

    selector.addEventListener("change", () => {
      let selectedMinor = selector.value;
      if (selectedMinor !== "none" && selectedMinor !== minor) {
        changeBtn.disabled = false;
      } else {
        changeBtn.disabled = true;
      }
    });

    changeBtn.addEventListener("click", changeUserMinor);
  }

  /**
   * Sends a request to update the user's major and reloads the page upon success.
   * @async
   */
  async function changeUserMajor() {
    let selectedMajor = id("major-minor-switch").value;
  
    try {
      let response = await fetch('/update-major', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({major: selectedMajor}),
      });
  
      if (!response.ok) {
        return;
      }

      location.reload();

    } catch (error) {
      console.error(error);
      return;
    }
  }

  /**
   * Sends a request to update the user's minor and reloads the page upon success.
   * @async
   */
  async function changeUserMinor() {
    let selectedMinor = id("major-minor-switch").value;
  
    try {
      let response = await fetch('/update-minor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({minor: selectedMinor}),
      });
  
      if (!response.ok) {
        return;
      }

      location.reload();

    } catch (error) {
      console.error(error);
      return;
    }
  }

  /**
   * Fetches the user's course history, including completed and in-progress courses.
   * @async
   * @return {Object} An object containing course history or undefined on error.
   */
  async function findCourseStatus() {
    try {
      let response = await fetch("/course-history");
      if (!response.ok) {
        return;
      }
      let data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  /**
   * Updates the profile UI to display the current user's initials in the profile circle.
   * @param {string} currentUser - The username of the current user.
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
   * Sets up the navigation button inside the hamburger menu.
   */
  function setupHBMButtons() {
    id("view-mm").addEventListener("click", () => {
      window.location.href = "degree-information.html";
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
   * Creates a new HTML element of the specified type.
   * @param {string} element - The tag name of the element to create.
   * @return {HTMLElement} A new HTML element of the specified type.
   */
  function gen(element) {
    return document.createElement(element);
  }
})();
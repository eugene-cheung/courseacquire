/*
 * Names: Mason Howes, Eugene Cheung
 * Date: December 10th, 2024
 * Section: CSE 154 AD
 *
 * This is the checkout javascript file that allows users to enroll in the classes they've
 * added to their bookmarks. It checks to make sure that the user has taken the proper
 * prerequisite classes before allowing them to enroll. It also helps them gauge the
 * number of credits the classes they are enrolling in add up to.
 */

"use strict";

(function() {
  let cart = [];
  let isConfirmed = false;

  window.addEventListener("load", init);

  /**
   * Initializes the page by setting up event listeners for the checkout page.
   */
  function init() {
    setupProfileListeners();
    setupLoginListeners();
    updateLoginUI();
    setupMenuListeners();
    checkLoginStatus();
    fetchCart();
    populateYearSelect();
    id("confirm-btn").addEventListener("click", confirmTransaction);
    id("submit-btn").addEventListener("click", submitTransaction);
  }

  /**
   * Populates the year dropdown menu with options from the current year to five years ahead.
   */
  function populateYearSelect() {
    const yearSelect = id("year-select");
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year <= currentYear + 5; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    }
  }

  /**
   * Submits the transaction after confirmation, sending the cart data to the server.
   * Displays success or error messages based on the response.
   * @async
   */
  async function submitTransaction() {
    if (!isConfirmed) {
      showError("Please confirm your transaction before submitting");
      return;
    }
  
    const term = id("term-select").value;
    const year = id("year-select").value;
  
    try {
      let response = await fetch("/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart, term, year }),
      });
  
      if (!response.ok) {
        let errorData = await response.json();
        throw new Error(errorData.message || "Failed to enroll in courses");
      }
  
      let data = await response.json();
      showSuccess(`Enrollment successful! Confirmation number: ${data.confirmationNumber}`);
      id("submit-btn").disabled = true;
      id("confirm-btn").disabled = true;
    } catch (error) {
      console.error("Error submitting transaction:", error);
      showError(error.message);
    }
  }
  
  /**
   * Displays an error message to the user.
   * @param {string} message - The error message to display.
   */
  function showError(message) {
    let errorElement = id("error-message");
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
    id("success-message").classList.add("hidden");
  }
  
  /**
   * Displays a success message to the user.
   * @param {string} message - The success message to display.
   */
  function showSuccess(message) {
    let successElement = id("success-message");
    successElement.textContent = message;
    successElement.classList.remove("hidden");
    id("error-message").classList.add("hidden");
  }
  
  /**
   * Gets an element by its ID.
   * @param {string} idName - The ID of the element.
   * @return {HTMLElement} The element with the specified ID.
   */
  function id(elementId) {
    return document.getElementById(elementId);
  }

  /**
   * Checks the user's login status and redirects to the registration page if not logged in.
   * @async
   */
  async function checkLoginStatus() {
    try {
      let response = await fetch("/check-login");
      if (!response.ok) {
        throw new Error("Failed to check login status");
      }
      let data = await response.json();
      if (!data.isLoggedIn) {
        window.location.href = "register.html";
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  }

  /**
   * Fetches the cart data from the server and updates the cart display.
   * @async
   */
  async function fetchCart() {
    try {
      let response = await fetch("/get-cart");
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      let data = await response.json();
      cart = data.cart;
      displayCart();
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }

  /**
   * Displays the cart items and updates the total credits and button states.
   * Sets up event listeners for remove buttons.
   */
  function displayCart() {
    let cartContainer = id("cart-items");
    cartContainer.innerHTML = "";
    let totalCredits = 0;

    cart.forEach(course => {
      let courseElement = document.createElement("div");
      courseElement.classList.add("cart-item");
      courseElement.innerHTML = `
        <div class="co-item-header">
          <h3>${course.name}</h3>
          <img class="remove-btn icon" data-id="${course.course_id}" src="img/delete.svg" alt="X">
        </div>
        <p>Credits: ${course.credits}</p>
        <p>Time: ${course.time}</p>
      `;
      cartContainer.appendChild(courseElement);
      totalCredits += course.credits;
    });

    id("total-credits").textContent = totalCredits;
    id("confirm-btn").disabled = cart.length === 0 || totalCredits > 18;
    
    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", removeCourseFromCart);
    });
  }

  /**
   * Removes a course from the cart on the server and updates the UI.
   * @param {Event} event - The event triggered by clicking the remove button.
   * @async
   */
  async function removeCourseFromCart(event) {
    let courseId = event.target.dataset.id;
    try {
      let response = await fetch("/remove-from-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });
      if (!response.ok) {
        throw new Error("Failed to remove course from cart");
      }
      await fetchCart();
      isConfirmed = false;
      id("submit-btn").disabled = true;
    } catch (error) {
      console.error("Error removing course from cart:", error);
    }
  }

  /**
   * Confirms the transaction if it is valid, enabling the submit button.
   */
  function confirmTransaction() {
    if (validateTransaction()) {
      isConfirmed = true;
      id("submit-btn").disabled = false;
      id("confirm-btn").disabled = true;
      showSuccess("Transaction confirmed. Click Submit to complete your enrollment.");
    }
  }

  /**
   * Validates the transaction by ensuring total credits do not exceed 18.
   * @return {boolean} Whether the transaction is valid.
   */
  function validateTransaction() {
    let totalCredits = cart.reduce((sum, course) => sum + course.credits, 0);
    if (totalCredits > 18) {
      showError("Total credits cannot exceed 18");
      return false;
    }
    return true;
  }

  /**
   * Submits the course enrollment transaction to the server.
   * Displays success or error messages based on the server response.
   * Disables submission buttons upon successful transaction.
   * @async
   */
  async function submitTransaction() {
    if (!isConfirmed) {
      showError("Please confirm your transaction before submitting");
      return;
    }
  
    const term = id("term-select").value;
    const year = id("year-select").value;
  
    try {
      let response = await fetch("/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart, term, year }),
      });
      if (!response.ok) {
        let errorData = await response.json();
        throw new Error(errorData.message || "Failed to enroll in courses");
      }
  
      let data = await response.json();
      showSuccess(`Enrollment successful! Confirmation number: ${data.confirmationNumber}`);
      id("submit-btn").disabled = true;
      id("confirm-btn").disabled = true;
    } catch (error) {
      console.error("Error submitting transaction:", error);
      showError(error.message);
    }
  }
  
  /**
   * Displays an error message in the UI.
   * Hides any existing success message.
   * @param {string} message - The error message to display.
   */
  function showError(message) {
    let errorElement = id("error-message");
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
    id("success-message").classList.add("hidden");
  }
  
  /**
   * Displays a success message in the UI.
   * Hides any existing error message.
   * @param {string} message - The success message to display.
   */
  function showSuccess(message) {
    let successElement = id("success-message");
    successElement.textContent = message;
    successElement.classList.remove("hidden");
    id("error-message").classList.add("hidden");
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
   * Updates the UI based on the login status of the user.
   * Displays profile information or a sign-in reminder accordingly.
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
   * Fetches the current user's email from the server.
   * @returns {Promise<string>} The email address of the user or an error message.
   * @async
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
        return "Error fetching email";
      }
    } catch (error) {
      return "Error fetching email";
    }
  }

  /**
   * Logs out the current user by sending a logout request to the server
   * and clearing local storage data.
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
   * Fills the profile circle with the first letter of the user's name
   * and toggles visibility of profile elements based on login state.
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
   * Sets up event listeners for the buttons on the home menu bar (HBM).
   * Navigates to appropriate pages when clicked.
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
})();
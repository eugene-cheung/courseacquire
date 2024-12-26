/*
 * Names: Mason Howes, Eugene Cheung
 * Date: December 10th, 2024
 * Section: CSE 154 AD
 *
 * This is the register javascript file that handles new account creation. It allows users
 * to set their username, email address, and password. This can be used to store their enrollment
 * information on other sectors of the CourseAcquire webiste.
 */

"use strict";

(function() {

  window.addEventListener("load", init);

  /**
   * Initializes the page by setting up event listeners for the signup form.
   */
  function init() {
    setupSignUp();
  }

  /**
   * Sets up the signup form submission handler.
   * Prevents default form submission and calls the registration process.
   */
  function setupSignUp() {
    const signupForm = id("signup-form");

    if (signupForm) {
      signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await registerUser();
      });
    }
  }

  /**
   * Registers a new user by sending their credentials to the server.
   * Navigates to the homepage on successful registration.
   * Logs or handles errors on failure.
   * @async
   * @return {null} Returns null if registration fails.
   */
  async function registerUser() {
    const username = id("signup-username").value.trim();
    const email = id("signup-email").value.trim();
    const password = id("signup-password").value.trim();
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({username, email, password})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register.");
      }
      window.location.href = "/";
    } catch (error) {
      return null;
    }
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
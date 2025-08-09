// Wait for the full DOM to load before attatching event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Handle login form validation
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value.trim();
      let errors = [];

      // Validate email presence and format
      if (!email) errors.push("Email is required.");
      else if (!/\S+@\S+\.\S+/.test(email)) errors.push("Email format is invalid.");

      // Validate password presence
      if (!password) errors.push("Password is required.");

      // Prevent form submission and display errors if any validations fail
      if (errors.length > 0) {
        e.preventDefault();  // Stop form from submitting
        displayErrors(errors);  // Show user-friendly error messages
      }
    });
  }

  // Handle registration form validation
  const registerForm = document.getElementById("register-form");

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      const name = registerForm.name.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value.trim();
      let errors = [];

      // Name must be present
      if (!name) errors.push("Name is required.");

      // Validate email presence and format
      if (!email) errors.push("Email is required.");
      else if (!/\S+@\S+\.\S+/.test(email)) errors.push("Email format is invalid.");

      // Validate password presence and minimum length
      if (!password) errors.push("Password is required.");
      else if (password.length < 6) errors.push("Password must be at least 6 characters.");

      // Prevent form submission and show errors
      if (errors.length > 0) {
        e.preventDefault();
        displayErrors(errors);
      }
    });
  }

  // Helper function to display errors inside an element with id 'form-errors'
  function displayErrors(errors) {
    const errorContainer = document.getElementById("form-errors");
    if (!errorContainer) return;
    errorContainer.innerHTML = errors.map(e => `<p class="error">${e}</p>`).join("");
  }
});
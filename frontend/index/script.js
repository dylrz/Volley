// Open the popup
function openPopup(popupId) {
    var popup = document.getElementById(popupId);
    popup.style.display = 'flex';
  }
  
  // Close the popup
  function closePopup(popupId) {
    var popup = document.getElementById(popupId);
    popup.style.display = 'none';
  }
  
  // Handle form submission
  function handleFormSubmission(formId) {
    var form = document.getElementById(formId);
    var email = form.elements.email.value;
    var password = form.elements.password.value;
  
    // Perform necessary operations with the email and password
    console.log('Email:', email);
    console.log('Password:', password);
  
    // Close the popup
    if (formId === 'loginForm') {
      closePopup('loginPopup');
    } else if (formId === 'createAccountForm') {
      closePopup('createAccountPopup');
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("createAccountForm");
  
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const formData = new FormData(form);
      const userObject = {};
  
      formData.forEach((value, key) => {
        userObject[key] = value;
      });
  
      // Call the backend function to save the data to MongoDB
      await saveToMongoDB(userObject);
    });
  });
  
  async function saveToMongoDB(userObject) {
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userObject),
      });
  
      if (response.ok) {
        console.log("User data saved successfully!");
      } else {
        console.error("Failed to save user data:", response.status, response.statusText);
      }
    } catch (err) {
      console.error("Error saving user data:", err);
    }
  }

  // Attach event listeners
  document.getElementById('loginButton').addEventListener('click', function() {
    openPopup('loginPopup');
  });
  
  document.getElementById('createAccountButton').addEventListener('click', function() {
    openPopup('createAccountPopup');
  });
  
  document.getElementById('loginCloseButton').addEventListener('click', function() {
    closePopup('loginPopup');
  });
  
  document.getElementById('createAccountCloseButton').addEventListener('click', function() {
    closePopup('createAccountPopup');
  });
  
  document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    handleFormSubmission('loginForm');
  });
  
  document.getElementById('createAccountForm').addEventListener('submit', function(event) {
    event.preventDefault();
    handleFormSubmission('createAccountForm');
  });
  
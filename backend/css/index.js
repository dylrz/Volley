// const sign_in_btn = document.querySelector('#sign-in-btn');
// const sign_up_btn = document.querySelector('#sign-up-btn');
// const container = document.querySelector('.container')

// sign_up_btn.addEventListener('click', () => {
//     container.classList.add('sign-up-mode')
// })

// sign_in_btn.addEventListener('click', () => {
//     container.classList.remove('sign-up-mode')
// })

document.addEventListener("DOMContentLoaded", function() {
    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");
  
    // Function to show the sign-up form
    function showSignUp() {
      container.classList.add("sign-up-mode");
    }
  
    // Function to show the sign-in form
    function showSignIn() {
      container.classList.remove("sign-up-mode");
    }
  
    // Event listeners for the buttons
    sign_up_btn.addEventListener("click", showSignUp);
    sign_in_btn.addEventListener("click", showSignIn);
  
    // Check the value of 'showForm' that was set by the server, and show the appropriate form
    if (showForm === 'register') {
      showSignUp();
    }
  });
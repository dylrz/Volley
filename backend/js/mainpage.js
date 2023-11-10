function teamSubmit(event) {
  event.preventDefault(); // Preventing the form from submitting traditionally

  var data = {
    teamName: document.getElementById('teamname').value,
    league: document.getElementById('league').value, // It seems you're using 'username' for league, which might be a typo.
    numPlayers: document.getElementById('numplayers').value
  };

  fetch('/create-team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = '/player-entry'; // Redirect to the new page for entering players' details
    } else {
      // Handle errors here
      console.error('Error:', data.error);
    }
  })
  .catch((error) => {
    // Possible network error or server isn't responding
    console.error('Error:', error);
  });
}

// This function could be called when the form is submitted, for example
function validateForm() {
  var numPlayersInput = document.getElementById('numPlayers').value;
  var numPlayers = Number(numPlayersInput);

  if (isNaN(numPlayers) || !Number.isInteger(numPlayers)) {
    alert("Please enter a valid integer for the number of players.");
    return false;
  }
  return true;
}

function initializeCreateTeamButton() {
  var createTeamButton = document.getElementById('start-create-team');
  if (createTeamButton) {
    createTeamButton.addEventListener('click', function(event) {
      event.preventDefault();
      // Make a request to the server route that will render your new view
      window.location.href = '/create-team';
    });
  } else {
    console.error("Can't find the button with ID 'teamcreate'.");
  }
}
// This will ensure the initializeCreateTeamButton function is called when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeCreateTeamButton);


function deleteTeam(teamId) {
  fetch(`/delete-team/${teamId}`, { method: 'DELETE' })
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          console.log('Team deleted:', data);
          window.location.reload(); // Reload the page to update the list of teams
      })
      .catch(error => {
          console.error('Error:', error);
      });
}
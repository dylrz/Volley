function teamSubmit(event) {
  event.preventDefault(); // preventing the form from submitting traditionally

  var data = {
    teamName: document.getElementById('teamname').value,
    league: document.getElementById('league').value,
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
      window.location.href = '/player-entry';
    } else {
      console.error('Error:', data.error);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

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

      window.location.href = '/create-team';
    });
  } else {
    console.error("Can't find the button with ID 'teamcreate'.");
  }
}
document.addEventListener('DOMContentLoaded', initializeCreateTeamButton);


function deleteTeam(teamId) {

  const isConfirmed = window.confirm("Are you sure you want to delete this team?");

  if (isConfirmed) {
    fetch(`/delete-team/${teamId}`, { method: 'DELETE' })
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          console.log('Team deleted:', data);
          window.location.reload(); // reload the page to update the list of teams
      })
      .catch(error => {
          console.error('Error:', error);
      });
  } else {
    console.log('Team deletion cancelled');
  }
}

function toggleTaskbar(teamId) {
  var taskbar = document.getElementById('taskbar-' + teamId);
  if (taskbar.style.display === "block") {
    taskbar.style.display = "none";
    document.addEventListener('click', handleClickOutside, true);
  } else {
    taskbar.style.display = "block";
    document.addEventListener('click', handleClickOutside, true);
  }
  function handleClickOutside(event) {
    if (!taskbar.contains(event.target) && taskbar.style.display === "block") {
      taskbar.style.display = "none";
      document.removeEventListener('click', handleClickOutside, true);
    }
  }
}
function teamSubmit(event) {
    event.preventDefault();
  
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
  
  function cancelCreateTeamButton() {
    var cancelButton = document.getElementById('cancel-team-creation');
    if (cancelButton) {
      cancelButton.addEventListener('click', function(event) {
        event.preventDefault();
  
        window.location.href = '/main';
      });
    } else {
      console.error("Can't find the button with ID 'cancel-team-creation'.");
    }
  }
  document.addEventListener('DOMContentLoaded', cancelCreateTeamButton);
  
  
  function backCreateTeamButton() {
    var nextButton = document.getElementById('back-team-creation');
    if (nextButton) {
      nextButton.addEventListener('click', function(event) {
        event.preventDefault();
  
        window.location.href = '/create-team';
      });
    } else {
      console.error("Can't find the button with ID 'back-team-creation'.");
    }
  }
  document.addEventListener('DOMContentLoaded', backCreateTeamButton);
  
  
  function continueCreateTeamButton() {
    var nextButton = document.getElementById('continue-team-creation');
    var rosterSizeInput = document.getElementById('rosterSize')
    var createTeamForm = document.getElementById('teamInfoForm');
    
    if (nextButton && rosterSizeInput && createTeamForm) {
      nextButton.addEventListener('click', function(event) {
        event.preventDefault();
        var rosterSize = rosterSizeInput.value;
        
        if (!rosterSize) {
          console.error('Roster size is not defined.');
          return;
        }
  
        createTeamForm.action = '/create-team';
        createTeamForm.submit();
      });
    } else {
      console.error("Can't find the button with ID 'continue-team-creation'.");
    }
  }
  document.addEventListener('DOMContentLoaded', continueCreateTeamButton);
  
  
  function finishCreateTeamButton() {
    var nextButton = document.getElementById('finish-team-creation');
    if (nextButton) {
      nextButton.addEventListener('click', function(event) {
        event.preventDefault();
  
        var teamData = collectTeamData();
  
        // AJAX request to the server
        fetch('/create-team-finalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(teamData),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
        })
        .then(data => {
          console.log('Team created successfully:', data);
          window.location.href = '/main'; // redirects only after successful server response
        })
        .catch(error => {
          console.error('There has been a problem with your fetch operation:', error);
        });
      });
    } else {
      console.error("Can't find the button with ID 'finish-team-creation'.");
    }
  }
  
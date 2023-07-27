function createStatTables(event) {
  event.preventDefault(); // Prevent form submission

  const numPlayersInput = document.getElementById('numPlayers');
  const numPlayers = parseInt(numPlayersInput.value, 10);

  // Clear existing content
  const playerForm = document.getElementById('playerForm');
  playerForm.innerHTML = '';

  // Create stat tables for each player
  for (let i = 1; i <= numPlayers; i++) {
    const playerStats = document.createElement('div'); // Define playerStats variable
    playerStats.className = 'player-stats';

    const playerNameContainer = document.createElement('div');
    playerNameContainer.className = 'player-name-container';

    const playerName = document.createElement('h2');
    playerName.textContent = 'Player ' + i;
    playerNameContainer.appendChild(playerName);

    const nameInput = document.createElement('input');
    nameInput.setAttribute('type', 'text');
    nameInput.setAttribute('value', playerName.textContent);
    nameInput.style.display = 'none';
    playerNameContainer.appendChild(nameInput);

    const editButton = document.createElement('button');
    editButton.className = 'edit';
    editButton.textContent = 'Edit';
    playerNameContainer.appendChild(editButton);

    playerStats.appendChild(playerNameContainer);

    editButton.addEventListener('click', function () {
      if (editButton.textContent === 'Edit') {
        playerName.style.display = 'none';
        nameInput.style.display = 'inline-block';
        nameInput.focus();
        editButton.textContent = 'Done';
      } else {
        playerName.textContent = nameInput.value;
        playerName.style.display = 'inline-block';
        nameInput.style.display = 'none';
        editButton.textContent = 'Edit';
        updateStatsTable(); // Call the table update function
      }
    });

    // Create stat rows for each category
    const stats = ['kills', 'attempts', 'attack Errors','digs', 'assists', 'service Aces', 'service Errors'];
    for (const stat of stats) {
      const statRow = document.createElement('div');
      statRow.className = 'stat-row';

      const label = document.createElement('label');
      label.setAttribute('for', stat);
      label.textContent = stat.charAt(0).toUpperCase() + stat.slice(1) + ':';
      statRow.appendChild(label);

      const inputGroup = document.createElement('div');
      inputGroup.className = 'input-group';

      // Text Box For Stat Numbers
      const input = document.createElement('input');
      input.setAttribute('type', 'number');
      input.setAttribute('id', i + '-' + stat);
      input.setAttribute('min', '0');
      input.setAttribute('value', '0');
      input.setAttribute('readonly', true);
      input.className = 'large-input';
      inputGroup.appendChild(input);

      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'button-group';

      const incrementButton = document.createElement('incrementbutton');
      incrementButton.className = 'increment';
      incrementButton.setAttribute('onclick', "incrementStat('" + i + '-' + stat + "')");
      incrementButton.textContent = '+';
      buttonGroup.appendChild(incrementButton);

      const decrementButton = document.createElement('decrementbutton');
      decrementButton.className = 'decrement';
      decrementButton.setAttribute('onclick', "decrementStat('" + i + '-' + stat + "')");
      decrementButton.textContent = '-';
      buttonGroup.appendChild(decrementButton);

      inputGroup.appendChild(buttonGroup);
      statRow.appendChild(inputGroup);
      playerStats.appendChild(statRow);
    }

    playerForm.appendChild(playerStats);
  }

  // Add reset and submit buttons
  const buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';

  const resetButton = document.createElement('button');
  resetButton.setAttribute('id', 'resetButton');
  resetButton.textContent = 'Reset';
  resetButton.addEventListener('click', resetValues);
  buttonRow.appendChild(resetButton);

  const submitButton = document.createElement('button');
  submitButton.setAttribute('id', 'submitButton');
  submitButton.textContent = 'Submit';
  buttonRow.appendChild(submitButton);

  playerForm.appendChild(buttonRow);
}

function resetValues() {
  const inputs = document.getElementsByTagName('input');

  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type === 'number') {
      inputs[i].value = 0;
    }
  }
  updateStatsTable(); // Update the stats table after resetting the values
}

function incrementStat(stat) {
  const input = document.getElementById(stat);
  input.value = parseInt(input.value, 10) + 1;
  updateStatsTable();
}

function decrementStat(stat) {
  const input = document.getElementById(stat);
  if (parseInt(input.value, 10) > 0) {
    input.value = parseInt(input.value, 10) - 1;
    updateStatsTable();
  }
}
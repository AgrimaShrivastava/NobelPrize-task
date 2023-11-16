

fetch('data.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(jsonData => {
    if (!jsonData || !Array.isArray(jsonData.prizes)) {
      throw new Error('Invalid JSON data format. Expected an object with a "prizes" array.');
    }

    console.log('Fetched JSON data:', jsonData);

    const tableBody = document.querySelector('#nobelTable tbody');
    if (!tableBody) {
      throw new Error('Table body not found.');
    }

    const categoryFilter = document.getElementById('categoryFilter');
    const yearFilter = document.getElementById('yearFilter');

    // Populate the category dropdown with options based on your data
    const uniqueCategories = [...new Set(jsonData.prizes.map(prize => prize.category))];
    uniqueCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.toLowerCase(); // You can adjust the value as needed
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

    // Populate the year dropdown with options from 1900 to 2018
    for (let year = 2018; year >= 1900; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    }

    // Function to populate the table with data based on filters
    function populateTable(prizes) {
      tableBody.innerHTML = '';

      prizes.forEach(prize => {
        const row = tableBody.insertRow();
        const yearCell = row.insertCell(0);
        const categoryCell = row.insertCell(1);
        const laureatesCell = row.insertCell(2);
        const motivationCell = row.insertCell(3);

        yearCell.textContent = prize.year;
        categoryCell.textContent = prize.category;

        let displayedMotivation = false;

        if (Array.isArray(prize.laureates)) {
          const laureatesInfo = prize.laureates.map(laureate => `ID: ${laureate.id} ${laureate.firstname} ${laureate.surname}: ${laureate.motivation}`).join('<br><br>');
          laureatesCell.innerHTML = laureatesInfo;

          const uniqueMotivations = [...new Set(prize.laureates.map(laureate => laureate.motivation))];
          const motivations = uniqueMotivations.join('<br>');
          motivationCell.innerHTML = motivations || 'No Nobel Prize was won this year.';
          displayedMotivation = true;
        }

        if (!displayedMotivation && prize.overallMotivation) {
          motivationCell.innerHTML = prize.overallMotivation;
        } else if (!displayedMotivation) {
          console.error('Invalid laureates data for prize:', prize);
        }
      });
    }

    // Function to update the table based on selected filters
    function updateTable() {
      const categoryFilterValue = categoryFilter.value.toLowerCase();
      const yearFilterValue = yearFilter.value;

      const filteredPrizes = jsonData.prizes.filter(prize => {
        const categoryMatch = categoryFilterValue === '' || prize.category.toLowerCase() === categoryFilterValue;
        const yearMatch = yearFilterValue === '' || prize.year == yearFilterValue; // Use == to allow for loose equality
        return categoryMatch && yearMatch;
      });

      populateTable(filteredPrizes);
    }

    // Add event listeners to update the table when filters change
    categoryFilter.addEventListener('change', updateTable);
    yearFilter.addEventListener('change', updateTable);

    // Initial population of the table with all data
    populateTable(jsonData.prizes);
  })
  .catch(error => console.error('Error fetching or parsing data:', error));


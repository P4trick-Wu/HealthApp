// listener for uploading new timeslots

document.getElementById("newScheduleButton").addEventListener("click", updateSchedule);

// Uploads new trainer schedule to database
function updateSchedule () {

    // Store data from input fields into varaibles
    const newTitleInput = document.getElementById('newTitle').value;
    const newDateTimeInput = document.getElementById('newDateTime').value;
    const newEndTimeInput = document.getElementById('newEndTime').value;
    const newCostInput = document.getElementById('newCost').value;

    // Check if any of the input fields are empty
    if (!newTitleInput || !newDateTimeInput || !newEndTimeInput || !newCostInput) {

        // Display error message to the user
        alert('Please fill in all fields before submitting.');
        return;
    }

    // Create object with data
    const data = {
        newTitle: newTitleInput,
        newDateTime: newDateTimeInput,
        newEndTime: newEndTimeInput,
        newCost: newCostInput
    };

    console.log(data)

    // Send data object to server for processing
    fetch('/new-schedule-data', {
        method: 'POST',
         headers: {
            'Content-Type': 'application/json' 
        },
        // Convert the data to JSON format
        body: JSON.stringify(data) 
    }).then(response => {
        console.log('Response status: ', response.status);
    }).catch(error => {
        // something went wrong
        console.error('Error: ', error.message);
    });

}

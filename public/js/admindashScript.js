function createRoom() {

    const name = document.getElementById('roomName').value;
    const capacity = document.getElementById('roomCapacity').value;

    // Ensures admin filled out all fields necessary for creating new room
    if(!name || !capacity) {
         // Display error message to the user
        alert('Please fill in all fields before submitting.');
        return;
    }

    // Sends data to server to be added into rooms table in database
    const data = {
        name: name,
        capacity: capacity
    };

     // Send data object to server for processing
    fetch('/create-new-room', {
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
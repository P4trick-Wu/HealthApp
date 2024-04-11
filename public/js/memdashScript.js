// listener for update steps form
document.getElementById("stepsUpdateButton").addEventListener("click", updateSteps);
// listener for finding classes that user has not signed up for yet
document.getElementById("findEvents").addEventListener("click", findEvents);


// Retrieves all classes not signed up for by user, displaying them on dashboard
function findEvents() {

     // Send data object to server for processing
    fetch('/find-events', {
        method: 'POST',
         headers: {
            'Content-Type': 'application/json' 
        },
        // body: JSON.stringify(data)
    }).then(response => {
        console.log('Response status: ', response.status);
        return response.json();
    }).then(responseData => { 
        // Process the JSON data received from the server, and update webpage
        
        const events = responseData.data;
        console.log(events)


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });
}


// Updates user step data
function updateSteps() {
    console.log("update steps called");

    // Get the values from the input fields
    const stepCount = document.getElementById("updateStepCount").value;
    const stepGoal = document.getElementById("updateStepGoal").value;


    // Create an object with the data to send to the server
    const data = {
        stepCount: stepCount,
        stepGoal: stepGoal
    };
    // console.log(data);

    // Update steps data on webpage
    if (stepCount > 0) {
        document.getElementById('stepCountText').innerHTML = stepCount;
    }
    if(stepGoal > 0) {
        document.getElementById('stepGoalText').innerHTML = stepGoal;
    }



    // send post request updating steps data to database
    fetch('/submit-steps-data', {
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
// listener for update steps form
document.getElementById("stepsUpdateButton").addEventListener("click", updateSteps);


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
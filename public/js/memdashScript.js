// listener for update steps form
document.getElementById("stepsUpdateButton").addEventListener("click", updateSteps);
// listener for finding classes that user has not signed up for yet
document.getElementById("findEvents").addEventListener("click", findEvents);
// Listener for finding your classes
document.getElementById("getMemberSchedules").addEventListener("click", findYourEvents);


// retrieves events that the user has signed up for, dispalying them
function findYourEvents() {

    fetch('/find-your-events', {
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

        const sessions = responseData.data;

        // Clear the current list
        const sessionslist = document.getElementById("yourSchedule");
        sessionslist.innerHTML = "";

        // iterate over list of events signed up by the user
        sessions.forEach(session => {
            const li = document.createElement("li");

            const date = session.date.split("T");

            // Append new drop down modal to list containing session details with delete button option
            li.innerHTML += `
                <div style="padding-bottom: 10px;"></div>
                <div class="dropdown">
                    <button
                        type="button"
                        class="btn btn-success dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-auto-close="outside"
                    >
                        ${session.title}
                    </button>
                    <form class="dropdown-menu p-4">
                        <p>Cost: ${session.cost }</p>
                        <p>Date: ${date[0]}</p>
                        <p>Start time: ${session.start}</p>
                        <p>Room: ${session.room }</p>
                        <p>Turnout: ${session.turnout}</p>
                        <button onclick="deleteUserEvent(this.id, event)" id="button:${session.seshid}" class="btn btn-danger">Delete session</button>
                    </form>
                </div>
                
            `;
            // Saves session id in element to be retrieved for other functions
            li.id = session.seshid;

            sessionslist.appendChild(li);
        });


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });
}

// Remove user from an event they signed up for from client and database by sending request to server
function deleteUserEvent(sessionId, event) {

    // Prevent the default form submission behavior, preventing page from restarting
    event.preventDefault();
    const id = sessionId.split(":")[1]

    // Remove list item from client
    const session = document.getElementById(id);
    session.innerHTML = "";

    // Create an object with the data to send to the server
    const data = {
       id: id
    };

    // Send schedule id to server to be deleted from signup table, and schedule turnout to be decremented
    fetch('/delete-user-event', {
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
        
        const sessions = responseData.data;
       
        //clear current list
        const sessionsList = document.getElementById("availableSessions");
        sessionsList.innerHTML = "";

        // Iterate over found rooms, making them clickable and selectable along with key info such as room name and capacity.
        sessions.forEach(session => {
            const li = document.createElement("li");

            const date = session.date.split("T")[0]

            li.innerHTML += `
               <a class="dropdown-item" href="#" onclick="signUp(this.id)" id="sessionid:${session.seshid}">Title: ${session.title} ,
                <Date: ${date} <br> Start time: ${session.start} <br> Turnout: ${session.turnout} </a>
            `;

            sessionsList.appendChild(li);
        });


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });
}

// Signs the user up for the session based on the option they clicked, then removes option from the list of available sessions
function signUp(scheduleId) {

    const data = {
        scheduleId: scheduleId.split(":")[1]
    };

    // Send data object to server for processing
    fetch('/sign-up', {
        method: 'POST',
         headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
    }).then(response => {
        console.log('Response status: ', response.status);
        return response.json();
    }).then(responseData => { 
        // Process the JSON data received from the server, and update webpage

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
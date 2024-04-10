// listener for uploading new timeslots

document.getElementById("newScheduleButton").addEventListener("click", updateSchedule);
document.getElementById("memberSearchButton").addEventListener("click", searchMembers);
document.getElementById("viewSchedulesButton").addEventListener("click", getSchedule);

// send request to server to get sessions from trainer, then update dash
function getSchedule() {

    // Send data object to server for processing
    fetch('/view-schedules', {
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

        const schedule = responseData.data

        // Clear the current list
        const sessionslist = document.getElementById("sessionsList");
        sessionslist.innerHTML = "";

        // Iterate over the updated list of members and append them to the list
        schedule.forEach(session => {
            const li = document.createElement("li");

            const date = session.date.split("T");

            li.textContent = "Title: " + session.title + ", Cost: " + session.cost + ", Date: " + date[0] + ", Start time: " + session.start
            + ", SessionID: " + session.seshid + ", Registered member id: " + session.id;

            // Create new delete button and append to corresponding list element
            // const but = document.createElement("button")
            // but.textContent = "Delete session"
            // but.className = "btn btn-danger"


            // li.appendChild(but)

            li.innerHTML += '<button onclick="deleteSession(this.id)" id="button:' + session.seshid + '" class="btn btn-danger">Delete session</button>'
            li.id = session.seshid

            sessionslist.appendChild(li);
        });

        


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });

}

// Deleletes session from database
function deleteSession(clickedId) {

    var listId = document.getElementById(clickedId).parentElement.id
    console.log(listId)
}

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

// Sends search request to server to find members with corresponding name
function searchMembers() {
    
    // Store name from input fifeld
    const name = document.getElementById("memberSearch").value;

    // Create an object with the data to send to the server
    const data = {
       name: name
    };

    console.log(data)

    // Send post request to server for finding name
    fetch('/find-members', {
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

        // console.log('Received data:', responseData.members[0]);
        const members = responseData.members;

        console.log(members)

        // Clear the current list
        const membersList = document.getElementById("membersList");
        membersList.innerHTML = "";

        // Iterate over the updated list of members and append them to the list
        members.forEach(member => {
            const li = document.createElement("li");

            li.textContent = "Name: " + member.name + ", Email: " + member.email + ", ID: " + member.id;
            membersList.appendChild(li);
        });


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });
}

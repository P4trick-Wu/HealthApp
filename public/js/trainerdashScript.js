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

            // Append new drop down modal to list containing session details
            li.innerHTML += `
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
                        <p>Date: ${date[0]}</p>
                        <p>Start time: ${session.start}</p>
                        <p>Room: ${session.room }</p>
                        <p>Turnout: ${session.turnout}</p>
                        <button onclick="deleteSession(this.id, event)" id="button:${session.seshid}" class="btn btn-danger">Delete session</button>
                    </form>
                </div>
                <div style="padding-bottom: 10px;"></div>
            `;
            li.id = session.seshid;

            sessionslist.appendChild(li);
        });

        


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });



}

// Deleletes session from database
function deleteSession(clickedId, event) {

    // Prevent the default form submission behavior
    event.preventDefault();

    // gets id of the list item containing session to be deleted
    let buttonData = document.getElementById(clickedId).id.split(":");
    let listId = buttonData[1]

    // Remove list item from client
    const session = document.getElementById(listId);
    session.innerHTML = "";

    // Create an object with the data to send to the server
    const data = {
       id: listId
    };

    // send id to server to be deleted
    fetch('/delete-session', {
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

// Uploads new trainer schedule to database
function updateSchedule () {

    // Store data from input fields into varaibles
    const newTitleInput = document.getElementById('newTitle').value;
    const newDateTimeInput = document.getElementById('newDateTime').value;
    const newEndTimeInput = document.getElementById('newEndTime').value;
    // const newCostInput = document.getElementById('newCost').value;

    const newRoomId = document.getElementById('chosenRoom').getAttribute("room-id");

    const newCapacity = document.getElementById('newCapacity').value;

    // Check if any of the input fields are empty, makes sure all fields are filled out
    if (!newTitleInput || !newDateTimeInput || !newEndTimeInput || !newRoomId || !newCapacity) {

        // Display error message to the user
        alert('Please fill in all fields before submitting.');
        return;
    }

    // Create object with data
    const data = {
        newTitle: newTitleInput,
        newDateTime: newDateTimeInput,
        newEndTime: newEndTimeInput,
        // newCost: newCostInput,
        newRoom: newRoomId,
        newCapacity: newCapacity
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

        // console.log(members)

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

function findRooms() {

     // request availalbe rooms from server
    fetch('/find-rooms', {
        method: 'POST',
         headers: {
            'Content-Type': 'application/json' 
        },
    }).then(response => {
        console.log('Response status: ', response.status);
        return response.json();
    }).then(responseData => { 
        // Process the JSON data received from the server, and update webpage

        const rooms = responseData.data;
        
        //clear current list
        const roomsList = document.getElementById("availableRooms");
        roomsList.innerHTML = "";

        // Iterate over found rooms, making them clickable and selectable along with key info such as room name and capacity.
        rooms.forEach(room => {
            const li = document.createElement("li");

            li.innerHTML += `
               <a class="dropdown-item" href="#" onclick="selectRoom(this.id, this.innerHTML)" id="roomOption:${room.name}">${room.name}, Capacity: ${room.capacity}</a>
            `;

            roomsList.appendChild(li);
        });


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });
}

// Prints the chosen room from dropdown onto modal
function selectRoom(id, data) {
    
    const roomId = id.split(":")[1]

    // sets attribute to room id so it can be passed back to server when creating new database entry
    const info = document.getElementById("chosenRoom");
    info.innerHTML = `Room chosen: ${data}`;
    info.setAttribute("room-id", roomId);
    


}

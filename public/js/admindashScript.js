// Creates a new room in the database
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

// gets list of all sessions
function findEvents() {
     // Send data object to server for processing
    fetch('/find-events-admin', {
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
               <a class="dropdown-item" href="#" onclick="deleteSession(this.id)" id="sessionid:${session.seshid}">Title: ${session.title} , 
               Trainer: ${session.trainer} <br> Room: ${session.room}
                <Date: ${date} <br> Start time: ${session.start} <br> Turnout: ${session.turnout} </a>
            `;

            sessionsList.appendChild(li);
        });


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });
}

// deletes session on client, sends id to be deleted from database
function deleteSession(sessionId) {

    // Deletes item from client
    const listItem = document.getElementById(sessionId);
    listItem.innerHTML = ""
    
    const data = {
        id: sessionId.split(":")[1]
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

// gets list of all rooms and their data, along with ability to delete them
function getRooms() {

    // Send data object to server for processing
    fetch('/find-rooms', {
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
        const rooms = responseData.data

        // Clear the current list
        const roomsList = document.getElementById("roomsList");
        roomsList.innerHTML = "";

        rooms.forEach(room => {
            const li = document.createElement("li");

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
                        ${room.name}
                    </button>
                    <form class="dropdown-menu p-4">
                        <p>Room ID: ${room.id }</p>
                        <p>Room capacity: ${room.capacity}</p>
                        <button onclick="deleteRoom(this.id, event)" id="button:${room.id}" class="btn btn-danger">Delete Room</button>

                    </form>
                </div>
                <div style="padding-bottom: 10px;"></div>
            `;
            li.id = room.id;

            roomsList.appendChild(li);
        });

    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });

}

// deletes room from client web app, sends request to sever to delete room from database
function deleteRoom(roomId, event) {

    // Prevent the default form submission behavior
    event.preventDefault();

    const id = roomId.split(":")[1]

    // remove list element containng room from client
    const listItem = document.getElementById(id);
    listItem.innerHTML = "";

    const data = {
        roomId: id
    };

    // Request server to delete room from dataase
    fetch('/delete-room', {
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

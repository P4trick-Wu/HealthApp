document.getElementById("memberSearchButton").addEventListener("click", searchMembers);

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

            li.textContent = "Name: " + member.name + ", Email: " + member.email + ", ID: " + member.id + ", Paid for: " + member.paidfor;
            membersList.appendChild(li);
        });


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });
}

// global button id that triggered modal
var triggerModalId;

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

// sends data to database to create new equipment
function createEquipment() {
    
    // Store data from input fields and make sure none are empty
    const equipmentName = document.getElementById('equipmentName').value;
    if (!equipmentName) {
        // Display error message to the user
        alert('Please fill in all fields before submitting.');
        return;
    }

    const data = {
        name: equipmentName
    };

    // Send data object to server for processing
    fetch('/create-equipment', {
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

// gets list of all equipment
function findEquipment() {

    // Send data object to server for processing
    fetch('/find-equipment-admin', {
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
        
        const equipment = responseData.data;

        // console.log(equipment)
       
        //clear current list
        const equipmentList = document.getElementById("currentEquipment");
        equipmentList.innerHTML = "";

        // Iterate over found rooms, making them clickable and selectable along with key info such as room name and capacity.
        equipment.forEach(item => {
            const li = document.createElement("li");

            // Added info and delete button option for sessions. Add modification options beside
            li.innerHTML += ` 
            <div class="dropdown">
                    <button
                        type="button"
                        class="btn btn-success dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-bs-auto-close="outside"
                    >
                        ${item.name}
                    </button>
                    <form class="dropdown-menu p-4">
                        <p>Room ID: ${item.roomid }</p>
                        <p>Durability: ${item.durability}</p>
                        <p>Remaining durability: ${item.durabilityRemaining}</p>
                        <button
                            type="button"
                            id="modalButton:${item.equipId}"
                            class="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#updateEquipment"
                            onclick="setTrigger(this.id)"
                            >
                            Update equipment 
                        </button>
                        <button onclick="deleteEquipment(this.id, event)" id="button:${item.equipId}" class="btn btn-danger">Delete equipment</button>
                    </form>
                </div>
                <div style="padding-bottom: 10px;"></div>
            `;
            li.id = "equipment:" + item.equipId;
            equipmentList.appendChild(li);
        });


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });

}

function updateEquipment() {

    const equipId = triggerModalId;


    // Initialize variables
    let newName = document.getElementById('newEquipmentName').value;
    let newDurability = document.getElementById('newEquipmentDurabilityRemaining').value;
    let newRoom = document.getElementById('newEquipmentRoom').value;

     // Check if any of the input fields are empty, makes sure all fields are filled out
    if (!newName || !newDurability || !newRoom ) {
        // Display error message to the user
        console.log(newName, newDurability, newRoom)
        alert('Please fill in all fields before submitting.');
        return;
    }

    const data = {
        name: newName,
        durability: newDurability,
        room: newRoom,
        equipid: equipId
    }

     // Send data object to server for processing
    fetch('/update-equipment', {
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

function deleteEquipment(equipId, event) {

    // Prevent the default form submission behavior
    event.preventDefault();

    // Deletes item from client
    const listItem = document.getElementById("equipment:" + equipId.split(":")[1]);
    listItem.innerHTML = ""

    const data = {
        equipid: equipId.split(":")[1] 
    };

    // send id to server to be deleted
    fetch('/delete-equipment', {
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

// updates schedule clicked on by admin
function updateSchedule() {

    const sessionId = triggerModalId;
    
    // Store data from input fields into varaibles
    const newTitleInput = document.getElementById('newTitle').value;
    const newDateTimeInput = document.getElementById('newDateTime').value;
    const newEndTimeInput = document.getElementById('newEndTime').value;

    // Check if any of the input fields are empty, makes sure all fields are filled out
    if (!newTitleInput || !newDateTimeInput || !newEndTimeInput ) {
        // Display error message to the user
        alert('Please fill in all fields before submitting.');
        return;
    }

    // Create object with data
    const data = {
        newTitle: newTitleInput,
        newDateTime: newDateTimeInput,
        newEndTime: newEndTimeInput,
        sessionId: sessionId

    };

    console.log("Changing session " ,  sessionId, "with these values")
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

            // Added info and delete button option for sessions. Add modification options beside
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
                        <p>Date: ${date}</p>
                        <p>Trainer: ${session.trainer}</p>
                        <p>Start time: ${session.start}</p>
                        <p>Room: ${session.room }</p>
                        <p>Turnout: ${session.turnout}</p>
                        <button
                            type="button"
                            id="modalButton:${session.seshid}"
                            class="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#updateClass"
                            onclick="setTrigger(this.id)"
                            >
                            Update session
                        </button>
                        <button onclick="deleteSession(this.id, event)" id="button:${session.seshid}" class="btn btn-danger">Delete session</button>
                    </form>
                </div>
                <div style="padding-bottom: 10px;"></div>
            `;
            li.id = session.seshid;
            sessionsList.appendChild(li);
        });


    }).catch(error => {
        // Something went wrong
        console.error('Error: ', error.message);
    });
}

// sets global varialbe to button clicked that brought up the modal
function setTrigger(buttonId) {
    triggerModalId = buttonId.split(":")[1];
}


// deletes session on client, sends id to be deleted from database
function deleteSession(sessionId, event) {

    // Prevent the default form submission behavior
    event.preventDefault();

    // Deletes item from client
    const listItem = document.getElementById(sessionId.split(":")[1]);
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

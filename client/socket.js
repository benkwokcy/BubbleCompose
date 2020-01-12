const TROTTLE_DELAY = 250;
// Properties of the current user

let notes = [];
var socket = io();

socket.on('newPattern', onPatternReceive);
socket.on('newClient', onNewClientReceive);
socket.on('registerAllData', onInitialDataReceived);
socket.on('registerId', (id) => {
    console.log("Registering our Id");
    myClientId = id;
});

function onInitialDataReceived(payload) {
    onClientsReceived(payload.clients);

    for (let pattern of payload.patterns) {
        onPatternReceive(pattern);
    }
}

function onPatternReceive(payload) {
    let client = findClientFromId(clients, payload.clientId);

    if (!client) {
        console.error("Cannot find client for pattern", payload);
        return null;
    } else {
        console.log("Received some shit from client ", client.id);
    }

    console.log("pattern", payload);
    sendPatternToAudio(client, payload);
}

function sendPatternToAudio(client, payload) {
    let melody = patternToMelody(client, payload);
    if (!melody) {
        console.error("Melody is dead");
        return;
    }

    console.log("melody: ", melody);
    addMelody(melody);
}

// TODO actually call this function so shit is setup!
function setClientVariables(name, instrument, shape, colour) {
    user.name = name;
    user.instrument = instrument;
    user.shape = shape;
    user.colour = colour;

    socket.emit('newClient', user); // Broadcast to all models.
    // Server will call registerId with the updated Id.
}

function sendPattern() {
    console.log("Sending pattern");

    let pattern = {
        'clientId': myClientId,
        'notes': notes
    };

    // Send to server
    socket.emit('newPattern', pattern);

    // Also send locally
    sendPatternToAudio(findClientFromId(clients, myClientId), pattern);

    notes = [];
}

function addNoteToSocket(note) {
    notes.push(note);
}

//TODO delete this - for unblocking before the welcome screen is done.
// Invarient = this must be set before we can send a pattern.
setClientVariables("Chonzo", "piano", "circle", "black");
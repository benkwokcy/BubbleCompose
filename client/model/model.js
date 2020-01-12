let clients = [];
let patterns = [];

function onPatternsReceived(payload) {
    for (let pattern of payload) {
        onPatternReceive(pattern);
    }
}

function onClientsReceived(payload) {
    clients = payload;
}

function onPatternReceive(pattern) {
    patterns.push(pattern);
}

function onNewClientReceive(payload) {
    let client = payload;
    clients.push(client);
}
const peerIdInput = document.getElementById('peerId');
const connectButton = document.getElementById('connectButton');
const sendButton = document.getElementById('sendButton');
const statusDisplay = document.getElementById('status');
const receivedDataDisplay = document.getElementById('receivedData');

let peer;
let connection;

// Create a new Peer instance
peer = new Peer();  // PeerJS will generate a random ID for you

// Once the peer is connected to the PeerJS server, display the ID
peer.on('open', (id) => {
    statusDisplay.textContent = 'Your peer ID: ' + id;
});

// Handle incoming connections
peer.on('connection', (conn) => {
    connection = conn;
    setupConnectionHandlers(connection);
    statusDisplay.textContent = 'Connected to peer: ' + connection.peer;
});

// When clicking "Connect", establish connection with another peer
connectButton.addEventListener('click', () => {
    const peerId = peerIdInput.value;
    connection = peer.connect(peerId);
    setupConnectionHandlers(connection);
});

// Send a random number when "Send Random Number" is clicked
sendButton.addEventListener('click', () => {
    const randomNumber = Math.floor(Math.random() * 100);
    connection.send(randomNumber);
    console.log('Sent:', randomNumber);
});

// Handle connection events
function setupConnectionHandlers(conn) {
    conn.on('open', () => {
        statusDisplay.textContent = 'Connected to peer: ' + conn.peer;
        sendButton.disabled = false;  // Enable the "Send" button
    });

    conn.on('data', (data) => {
        console.log('Received:', data);
        receivedDataDisplay.textContent = 'Received from peer: ' + data;
    });

    conn.on('close', () => {
        statusDisplay.textContent = 'Connection closed';
        sendButton.disabled = true;
    });
}
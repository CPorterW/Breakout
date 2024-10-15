const peerShortIdInput = document.getElementById('peerShortId');
const connectButton = document.getElementById('connectButton');
const sendButton = document.getElementById('sendButton');
const statusDisplay = document.getElementById('status');
const receivedDataDisplay = document.getElementById('receivedData');

let peer;
let connection;
let shortIdMapping = {};  // In-memory mapping for short IDs to full PeerJS IDs

// Function to generate a 4-digit short ID
function generateShortId() {
    return Math.floor(1000 + Math.random() * 9000);  // Generates a number between 1000 and 9999
}

// Create a new Peer instance
peer = new Peer();  // PeerJS will generate a random ID for you

// Once the peer is connected to the PeerJS server, display the short ID
peer.on('open', (id) => {
    const shortId = generateShortId();
    shortIdMapping[shortId] = id;  // Store the short ID to long ID mapping
    statusDisplay.textContent = 'Your short peer ID: ' + shortId;
});

// Handle incoming connections
peer.on('connection', (conn) => {
    connection = conn;
    setupConnectionHandlers(connection);
    statusDisplay.textContent = 'Connected to peer: ' + conn.peer;
});

// When clicking "Connect", use the short ID to establish connection with another peer
connectButton.addEventListener('click', () => {
    const shortId = peerShortIdInput.value;
    const peerId = shortIdMapping[shortId];  // Look up the full PeerJS ID

    if (peerId) {
        connection = peer.connect(peerId);
        setupConnectionHandlers(connection);
    } else {
        alert('No peer found with this short ID.');
    }
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
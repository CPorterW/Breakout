const sendButton = document.getElementById('sendButton');
const statusDisplay = document.getElementById('status');
const receivedDataDisplay = document.getElementById('receivedData');
const linkToShare = document.getElementById('linkToShare');
const shareUrlInput = document.getElementById('shareUrl');

let peer;
let connection;

// Create a new Peer instance
peer = new Peer();  // PeerJS will generate a random ID for you

// Once the peer is connected to the PeerJS server, display the link
peer.on('open', (id) => {
    const currentUrl = window.location.href.split('?')[0];  // Base URL without any query params
    const shareUrl = `${currentUrl}?peerId=${id}`;
    linkToShare.style.display = 'block';
    shareUrlInput.value = shareUrl;  // Display the URL to share
    statusDisplay.textContent = 'Your peer ID: ' + id + ' (Share the URL)';
});

// Extract the peerId from the URL if available
const urlParams = new URLSearchParams(window.location.search);
const peerIdFromUrl = urlParams.get('peerId');

if (peerIdFromUrl) {
    // If peerId is present in URL, automatically connect
    connection = peer.connect(peerIdFromUrl);
    setupConnectionHandlers(connection);
}

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

// Handle incoming connections
peer.on('connection', (conn) => {
    connection = conn;
    setupConnectionHandlers(connection);
    statusDisplay.textContent = 'Connected to peer: ' + conn.peer;
});
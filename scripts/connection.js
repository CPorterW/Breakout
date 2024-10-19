// Thanks to https://peerjs.com/docs/#start
const sendButton = document.getElementById('sendButton');
const statusDisplay = document.getElementById('status');
const receivedDataDisplay = document.getElementById('receivedData');
const linkToShare = document.getElementById('linkToShare');
const shareUrlInput = document.getElementById('shareUrl');
const myData = document.getElementById('myData');
const peerId = document.getElementById('peerId');

let myself;
let connection;

// Create a new Peer instance with configuration
function initializePeer() {
    myself = new Peer();

    myself.on('open', (id) => {
        document.getElementById('myId').value = id;
        const currentUrl = window.location.href.split('?')[0];
        const shareUrl = `${currentUrl}?peerId=${id}`;
        shareUrlInput.value = shareUrl;
        statusDisplay.textContent = 'Waiting for connection...';
    });


    // Handle incoming connections
    myself.on('connection', (conn) => {
        console.log('Incoming connection from:', conn.peer);
        connection = conn;
        setupConnectionHandlers(connection);
        linkToShare.setAttribute('hidden', 'hidden');
        peerId.value = conn.peer;
    });
}

initializePeer();

// Extract the peerId from the URL if available
const urlParams = new URLSearchParams(window.location.search);
const peerIdFromUrl = urlParams.get('peerId');

if (peerIdFromUrl) {
    setTimeout(connectToPeer, 2000);
} else {
    linkToShare.style.display = 'block';
}

function connectToPeer() {
    if (myself && myself.id) {
        connection = myself.connect(peerIdFromUrl, {
            reliable: true,
            serialization: 'json'
        });
        setupConnectionHandlers(connection);
    } else {
        console.log('Peer not ready, retrying in 2 seconds...');
        setTimeout(connectToPeer, 2000);
    }
}

// This is probably a dumb way to do this but I have a button in the 
// html that is clicked by breakout.js whenever a new frame is loaded.
// I plan to use this to allow users to see their peer's window.
sendButton.addEventListener('click', () => {
    if (connection && connection.open) {
        // Thanks to https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
        connection.send(localStorage.getItem(myself.id));
    } else {
        statusDisplay.textContent = 'Connection is not open';
    }
});

function setupConnectionHandlers(conn) {
    conn.on('open', () => {
        statusDisplay.textContent = 'Connected to peer: ' + conn.peer;
    });

    conn.on('data', (data) => {
        data = JSON.parse(data);
        localStorage.removeItem(conn.peer);
        localStorage.setItem(conn.peer, JSON.stringify(data));

        window.dispatchEvent(new CustomEvent('peerDataReceived', { detail: data }));
    });

    conn.on('close', () => {
        statusDisplay.textContent = 'Connection closed';
    });

    conn.on('error', (error) => {
        console.error('Connection error:', error);
        statusDisplay.textContent = 'Connection error: ' + error;
        // Attempt to reconnect
        if (peerIdFromUrl) {
            setTimeout(connectToPeer, 5000);
        }
    });
}
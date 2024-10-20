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

function initializePeer() {
    myself = new Peer();

    // When the connection to PeerJS opens, this happens.
    myself.on('open', (id) => {
        document.getElementById('myId').value = id;
        const currentUrl = window.location.href.split('?')[0];
        const shareUrl = `${currentUrl}?peerId=${id}`;
        shareUrlInput.value = shareUrl;
        statusDisplay.textContent = 'Waiting for connection...';
    });


    // When PeerJS facilitates a connection to another peer, this happens.
    myself.on('connection', (conn) => {
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

// Only if the peerId is present in the url, the site will immediately try to connect.
if (peerIdFromUrl) {
    setTimeout(connectToPeer, 2000);
} else {
    // If the peerId isn't present, then the shareable url will show.
    linkToShare.style.display = 'block';
}

function connectToPeer() {
    // Only if the connection to PeerJS has been properly opened will connections with peers
    // be attempted.
    if (myself && myself.id) {
        connection = myself.connect(peerIdFromUrl, {
            reliable: true,
            
            // This serialization makes parsing unnecessary.
            serialization: 'json'
        });
        
        setupConnectionHandlers(connection);
    } else {
        // Without this, connectToPeer would run many times a second
        // and error out the code.
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
        // This is sent through localStorage and I haven't learned
        // serialization yet, so here we are.
        data = JSON.parse(data);

        // This creates an event that can be used by breakout.js.
        window.dispatchEvent(new CustomEvent('peerDataReceived', { detail: data }));
    });

    conn.on('close', () => {
        statusDisplay.textContent = 'Connection closed';
    });

    conn.on('error', (error) => {
        statusDisplay.textContent = 'Connection error: ' + error;
        // Attempt to reconnect
        if (peerIdFromUrl) {
            setTimeout(connectToPeer, 5000);
        }
    });
}
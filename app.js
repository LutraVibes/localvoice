// app.js

document.addEventListener('DOMContentLoaded', () => {
    const createRoomBtn = document.getElementById('create-room');
    const joinRoomBtn = document.getElementById('join-room');
    const startCallBtn = document.getElementById('start-call');
    const endCallBtn = document.getElementById('end-call');

    const roomSection = document.getElementById('room-section');
    const verificationSection = document.getElementById('verification-section');
    const callSection = document.getElementById('call-section');
    const roomIdInput = document.getElementById('room-id');
    const displayRoomId = document.getElementById('display-room-id');
    const callStatus = document.getElementById('call-status');
    const callTime = document.getElementById('call-time');
    const participantCount = document.getElementById('participant-count');
    const remoteAudio = document.getElementById('remote-audio');

    let localStream = null;
    let peerConnection = null;
    let roomId = null;
    let callStartTime = null;
    let callTimer = null;
    let participants = 1; // Starts with the host

    // Constraints for WebRTC
    const constraints = {
        audio: true,
        video: false
    };

    createRoomBtn.addEventListener('click', createRoom);
    joinRoomBtn.addEventListener('click', joinRoom);
    startCallBtn.addEventListener('click', startCall);
    endCallBtn.addEventListener('click', endCall);

    async function createRoom() {
        roomId = Math.floor(10 + Math.random() * 90).toString();  // Generate a random 2-digit number
        displayRoomId.textContent = roomId;
        participantCount.textContent = participants;
        roomSection.style.display = 'none';
        verificationSection.style.display = 'block';
        callSection.style.display = 'block';
    }

    function joinRoom() {
        const inputRoomId = roomIdInput.value;
        if (inputRoomId.length !== 2 || isNaN(inputRoomId)) {
            alert('Invalid Room ID');
            return;
        }
        roomId = inputRoomId;
        participants++;
        displayRoomId.textContent = roomId;
        participantCount.textContent = participants;
        roomSection.style.display = 'none';
        callSection.style.display = 'block';
    }

    async function startCall() {
        try {
            // Use Web Bluetooth API to connect to the other device
            // Establish WebRTC connection once Bluetooth connection is established

            localStream = await navigator.mediaDevices.getUserMedia(constraints);
            peerConnection = new RTCPeerConnection();

            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    // Send candidate over Bluetooth to the other device
                }
            };

            peerConnection.ontrack = event => {
                const [remoteStream] = event.streams;
                remoteAudio.srcObject = remoteStream;
            };

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            callStatus.textContent = 'In call';
            startCallBtn.disabled = true;
            endCallBtn.disabled = false;
            callStartTime = new Date();
            callTimer = setInterval(updateCallTime, 1000);
        } catch (error) {
            console.error('Error starting call:', error);
        }
    }

    function endCall() {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
        callStatus.textContent = 'Not in call';
        startCallBtn.disabled = false;
        endCallBtn.disabled = true;
        clearInterval(callTimer);
        callTime.textContent = '00:00';
    }

    function updateCallTime() {
        const now = new Date();
        const elapsedTime = Math.floor((now - callStartTime) / 1000);
        const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
        const seconds = String(elapsedTime % 60).padStart(2, '0');
        callTime.textContent = `${minutes}:${seconds}`;
    }
});

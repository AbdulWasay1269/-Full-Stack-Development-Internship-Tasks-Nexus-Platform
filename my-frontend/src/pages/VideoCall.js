import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from '../context/AuthContext';

const VideoCall = () => {
    const { user } = useAuth();
    
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState("");
    const [callEnded, setCallEnded] = useState(false);

    const myVideo = useRef(null);
    const userVideo = useRef(null);
    const connectionRef = useRef(null);
    const socket = useRef(null);

    useEffect(() => {
        // Connect to the socket.io backend
        socket.current = io("http://localhost:5000");

        // Ask for media permissions (audio & video)
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
            setStream(mediaStream);
            if (myVideo.current) {
                myVideo.current.srcObject = mediaStream;
            }
        });

        // Backend socket.io-client mapping for WebRTC Offers 
        socket.current.on("offer", (data) => {
            setReceivingCall(true);
            setCaller(data.callerId);
            setCallerSignal(data.sdp); // Storing the SDP payload
        });

    }, []);

    // Call a user function
    const callUser = (id) => {
        const peer = new Peer({
            initiator: true, // We are sending the offer
            trickle: false,
            stream: stream
        });

        // 1. Peer generates Signal (The Offer)
        peer.on("signal", (data) => {
            socket.current.emit("offer", {
                targetUserId: id, // The person we are typing into the input
                callerId: user?._id || socket.current.id,
                sdp: data
            });
        });

        // 2. Peer receives remote stream
        peer.on("stream", (remoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        // 3. Let's listen for when the remote target "answers" via sockets
        socket.current.on("answer", (data) => {
            setCallAccepted(true);
            peer.signal(data.sdp); // Resolve connection!
        });

        connectionRef.current = peer;
    };

    // Answer a call function
    const answerCall = () => {
        setCallAccepted(true);

        const peer = new Peer({
            initiator: false, // We are answering
            trickle: false,
            stream: stream
        });

        // 1. Peer generates signal (The Answer)
        peer.on("signal", (data) => {
            socket.current.emit("answer", {
                targetUserId: caller,
                sdp: data
            });
        });

        // 2. Peer receives remote stream
        peer.on("stream", (remoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = remoteStream;
            }
        });

        // 3. Let peer process the pending offer
        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        window.location.reload();
    };

    const toggleAudio = () => {
        if(stream) {
            stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
        }
    };

    const toggleVideo = () => {
        if(stream) {
            stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
        }
    };

    if (!user) return <p>Please log in.</p>;

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Nexus Communication Array</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                {/* Local Video Component */}
                {stream && (
                    <video 
                        playsInline 
                        muted 
                        ref={myVideo} 
                        autoPlay 
                        style={{ width: "300px", border: "2px solid #ccc", background: "black" }} 
                    />
                )}
                
                {/* Remote Video Component */}
                {callAccepted && !callEnded ? (
                    <video 
                        playsInline 
                        ref={userVideo} 
                        autoPlay 
                        style={{ width: "300px", border: "2px solid green", background: "black" }} 
                    />
                ) : null}
            </div>

            <div style={{ margin: "20px 0" }}>
                <button onClick={toggleAudio} style={{ margin: '5px' }}>Toggle Audio</button>
                <button onClick={toggleVideo} style={{ margin: '5px' }}>Toggle Video</button>
            </div>

            <div style={{ padding: "20px", border: "1px solid #ddd", display: "inline-block", textAlign: "left" }}>
                <p><strong>Your Socket ID (Current Session):</strong> {socket.current?.id || 'Connecting...'}</p>
                <input 
                    type="text" 
                    placeholder="Enter ID to call" 
                    value={idToCall} 
                    onChange={(e) => setIdToCall(e.target.value)} 
                    style={{ padding: "5px", width: "200px" }}
                />
                
                {callAccepted && !callEnded ? (
                    <button style={{ marginLeft: "10px", color: "white", padding: "5px 10px", background: "red" }} onClick={leaveCall}>End Call</button>
                ) : (
                    <button style={{ marginLeft: "10px", color: "white", padding: "5px 10px", background: "blue" }} onClick={() => callUser(idToCall)}>Call</button>
                )}
            </div>

            {/* Answer Dashboard Incoming */}
            {receivingCall && !callAccepted ? (
                <div style={{ marginTop: "20px", padding: '10px', background: '#ffe6e6' }}>
                    <h3 style={{ margin: 0 }}>Someone is calling...</h3>
                    <button style={{ background: "green", color: "white", marginTop: "10px", padding: '10px 20px', border: 'none', cursor: 'pointer' }} onClick={answerCall}>
                        Answer
                    </button>
                </div>
            ) : null}
        </div>
    );
};

export default VideoCall;

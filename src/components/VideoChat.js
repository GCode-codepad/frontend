import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FaPhone, FaCopy } from "react-icons/fa"; // Using react-icons for icons
import Peer from "simple-peer";
import io from "socket.io-client";

// Connect to the WebSocket server
const socket = io.connect(`${process.env.REACT_APP_VIDEO_URL}`)

export const VideoChat = () => {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    // Get user media for video/audio
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      myVideo.current.srcObject = stream;
    });

    // Listen to "me" event from the server to get the user's socket ID
    socket.on("me", (id) => {
      setMe(id);
    });

    // Listen to "callUser" event to handle incoming calls
    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    // Cleanup function to avoid memory leaks
    return () => {
      socket.off("me");
      socket.off("callUser");
    };
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
    <>
      <h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
      <div className="container">
        <div className="video-container">
          <div className="video">
            {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
          </div>
          <div className="video">
            {callAccepted && !callEnded ? (
              <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
            ) : null}
          </div>
        </div>
        <div className="myId">
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="name">Name: </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
          </div>
          <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
            <button style={{ padding: "10px", borderRadius: "5px", backgroundColor: "#3f51b5", color: "white", cursor: "pointer" }}>
              <FaCopy style={{ marginRight: "10px" }} />
              Copy ID
            </button>
          </CopyToClipboard>

          <div style={{ marginTop: "20px" }}>
            <label htmlFor="idToCall">ID to call: </label>
            <input
              id="idToCall"
              type="text"
              value={idToCall}
              onChange={(e) => setIdToCall(e.target.value)}
              style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
          </div>
          <div className="call-button" style={{ marginTop: "20px" }}>
            {callAccepted && !callEnded ? (
              <button
                onClick={leaveCall}
                style={{ padding: "10px", borderRadius: "5px", backgroundColor: "red", color: "white", cursor: "pointer" }}
              >
                End Call
              </button>
            ) : (
              <button
                onClick={() => callUser(idToCall)}
                style={{ padding: "10px", borderRadius: "5px", backgroundColor: "#3f51b5", color: "white", cursor: "pointer" }}
              >
                <FaPhone style={{ marginRight: "10px" }} />
                Call
              </button>
            )}
          </div>
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller" style={{ marginTop: "20px" }}>
              <h1>{name} is calling...</h1>
              <button
                onClick={answerCall}
                style={{ padding: "10px", borderRadius: "5px", backgroundColor: "#3f51b5", color: "white", cursor: "pointer" }}
              >
                Answer
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

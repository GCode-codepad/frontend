// CollaborativeEditor.jsx
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import Peer from 'simple-peer';
import CodeEditor from './CodeEditor'; // Adjust the path as necessary

const CollaborativeEditor = () => {
  const { roomId } = useParams();
  const [code, setCode] = useState('// Start coding...');
  const [language, setLanguage] = useState('javascript'); // Initialize language state
  const [me, setMe] = useState('');
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callDisconnected, setCallDisconnected] = useState(false); // New state variable
  const [name, setName] = useState('Your Name');
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [output, setOutput] = useState('');
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socketRef = useRef();
  const typingRef = useRef(false); // To manage typing status
  const typingTimeoutRef = useRef(null); // To debounce typing events

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io.connect('http://localhost:8002'); // Adjust based on your server URL

    // Socket connection status
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      setMe(socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      // Refresh the page immediately
      window.location.reload();
    });

    // Join the room
    socketRef.current.emit('joinRoom', roomId);

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
        console.log('Obtained user media stream');
      })
      .catch((err) => {
        console.error('Failed to get media stream:', err);
      });

    // Handle incoming calls
    socketRef.current.on('callUser', (data) => {
      console.log('Receiving call from', data.from);
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    // Listen for userJoined event to get list of users
    socketRef.current.on('userJoined', (userId) => {
      setUsersInRoom((prevUsers) => [...prevUsers, userId]);
    });

    // Get existing users in the room
    socketRef.current.emit('getUsersInRoom', roomId);

    socketRef.current.on('usersInRoom', (users) => {
      setUsersInRoom(users.filter((id) => id !== socketRef.current.id));
    });

    // Listen for code changes from server
    socketRef.current.on('codeChange', ({ code: newCode }) => {
      setCode(newCode);
    });

    // Listen for language changes from server
    socketRef.current.on('languageChange', ({ language: newLanguage }) => {
      setLanguage(newLanguage);
    });

    // Listen for code output from server
    socketRef.current.on('codeOutput', ({ output }) => {
      setOutput(output);
    });

    // Listen for 'callEnded' event from the server
    socketRef.current.on('callEnded', () => {
      console.log('Call ended by the other user');
      setCallEnded(true);
      setCallDisconnected(true);
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    });

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      console.log('Cleaned up socket connections and peer connections');
    };
  }, [roomId]);

  const callUser = (id) => {
    console.log('Calling user:', id);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      },
    });

    peer.on('signal', (data) => {
      socketRef.current.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
      console.log(`Emitting callUser to ${id}`);
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
      console.log('Received stream from peer');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      // Refresh the page if there's a peer connection error
      window.location.reload();
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      // Refresh the page if the peer connection closes
      window.location.reload();
    });

    socketRef.current.on('callAccepted', (signal) => {
      console.log('Call accepted by', id);
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    console.log('Answering call from', caller);
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      },
    });

    peer.on('signal', (data) => {
      socketRef.current.emit('answerCall', { signal: data, to: caller });
      console.log(`Emitting answerCall to ${caller}`);
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
      console.log('Received stream from peer');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      // Refresh the page if there's a peer connection error
      window.location.reload();
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      // Refresh the page if the peer connection closes
      window.location.reload();
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    console.log('Leaving call');
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
      console.log('Destroyed peer connection');
    }
    // Do not disconnect the socket here
  };

  // Handle code changes
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socketRef.current.emit('codeChange', { roomId, code: newCode });
  };

  // Handle language changes
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    socketRef.current.emit('languageChange', { roomId, language: newLanguage });
  };

  // Handle running code
  const handleRunCode = async () => {
    try {
<<<<<<< Updated upstream
      const response = await fetch('http://localhost:8080/code/code/execute', { // Update with your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, code }),
      });
=======
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/code/code/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ language, code }),
        }
      );
>>>>>>> Stashed changes
      const data = await response.json();
      const output = data.output;
      setOutput(output);
      // Emit the output to other users in the room
      socketRef.current.emit('codeOutput', { roomId, output });
    } catch (error) {
      console.error('Error executing code:', error);
    }
  };

  return (
<<<<<<< Updated upstream
    <div style={{ display: 'flex', flexDirection: 'row' }}>
=======
    <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
>>>>>>> Stashed changes
      {/* Video Call and Controls */}
      <div style={{ width: '50%', padding: '20px' }}>
        {/* Video Streams */}
        <div>
          {stream && (
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              style={{ width: '300px', marginRight: '10px' }}
<<<<<<< Updated upstream
=======
              className={'rounded-2xl'}
>>>>>>> Stashed changes
            />
          )}
          {callAccepted && !callEnded && (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              style={{ width: '300px' }}
<<<<<<< Updated upstream
=======
              className={'rounded-2xl'}
>>>>>>> Stashed changes
            />
          )}
        </div>

<<<<<<< Updated upstream
        {/* Incoming Call Notification */}
        <div>
          {receivingCall && !callAccepted && (
            <div>
              <h1>{name} is calling...</h1>
              <button onClick={answerCall}>Answer</button>
=======
        {/* Notification when the other user disconnects */}
        {callDisconnected && (
          <div className="notification">
            The other user has disconnected.
          </div>
        )}

        {/* Incoming Call Notification */}
        <div>
          {receivingCall && !callAccepted && (
            <div className="modal">
              <div className="modal-content">
                <h2 className="text-2xl mb-4">You have a video call...</h2>

                <div className="">
                  <button
                    onClick={answerCall}
                    className=" bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Answer
                  </button>
                </div>
              </div>
>>>>>>> Stashed changes
            </div>
          )}
        </div>

        {/* Participants and Call Controls */}
        <div>
<<<<<<< Updated upstream
          <h2>Participants</h2>
          {usersInRoom.map((userId) => (
            <div key={userId} style={{ marginBottom: '5px' }}>
              <span>{userId}</span>
              <button
                onClick={() => callUser(userId)}
                style={{ marginLeft: '10px' }}
              >
                Call
              </button>
            </div>
          ))}
          {callAccepted && !callEnded && (
            <button onClick={leaveCall} style={{ marginTop: '10px' }}>
              End Call
            </button>
          )}
        </div>
      </div>

      {/* Code Editor Section */}
      <div style={{ width: '50%', padding: '20px' }}>
        <CodeEditor
          code={code}
          onChange={handleCodeChange}
          language={language}
          setLanguage={handleLanguageChange}
        />
        {/* Run Button */}
        <button onClick={handleRunCode} style={{ marginTop: '10px' }}>
          Run
        </button>
        {/* Output Display */}
        <div style={{ marginTop: '20px' }}>
          <h3>Output:</h3>
          <pre>{output}</pre>
        </div>

      </div>
=======
          {usersInRoom.map((userId) => (
            <div
              key={userId}
              style={{ marginBottom: '5px', marginTop: '5px' }}
            >
              <span>Participant</span>
              <button
                onClick={() => callUser(userId)}
                style={{ marginLeft: '10px' }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-2 rounded-3xl"
              >
                Call
              </button>
              {callAccepted && !callEnded && (
                <button
                  onClick={leaveCall}
                  style={{ marginTop: '10px', marginLeft: '20px' }}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-2 rounded-3xl"
                >
                  End Call
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor Section */}
      <div style={{ width: '50%', height: '70vh' }}>
        <CodeEditor
          code={code}
          onChange={handleCodeChange}
          language={language}
          setLanguage={handleLanguageChange}
        />
        {/* Run Button */}
        <div className="run-output-container">
          <button onClick={handleRunCode} className="run-button">
            Run
          </button>

          {/* Output Display */}
          <div className="output-container">
            <h3>Output:</h3>
            <pre className="output-pre">{output}</pre>
          </div>
        </div>
      </div>
>>>>>>> Stashed changes
    </div>
  );
};

export default CollaborativeEditor;

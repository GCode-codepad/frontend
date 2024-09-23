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

    // Listen for initial code from server
    socketRef.current.on('codeChange', ({ code: initialCode }) => {
      setCode(initialCode);
    });

    // Listen for language changes from server
    socketRef.current.on('languageChange', ({ language: newLanguage }) => {
      setLanguage(newLanguage);
    });

    // Listen for code output from server
    socketRef.current.on('codeOutput', ({ output }) => {
      setOutput(output);
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
    if (socketRef.current) {
      socketRef.current.disconnect();
      console.log('Disconnected socket');
    }
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
      const response = await fetch('http://localhost:8080/code/code/execute', { // Update with your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language, code }),
      });
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
    <div style={{ display: 'flex', flexDirection: 'row' }}>
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
            />
          )}
          {callAccepted && !callEnded && (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              style={{ width: '300px' }}
            />
          )}
        </div>

        {/* Incoming Call Notification */}
        <div>
          {receivingCall && !callAccepted && (
            <div>
              <h1>{name} is calling...</h1>
              <button onClick={answerCall}>Answer</button>
            </div>
          )}
        </div>

        {/* Participants and Call Controls */}
        <div>
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
    </div>
  );
};

export default CollaborativeEditor;

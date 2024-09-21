import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import Peer from "simple-peer";

const CollaborativeEditor = () => {
  const { roomId } = useParams();
  const [code, setCode] = useState('// Start coding...');
  const [me, setMe] = useState('');
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('Your Name');
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [language, setLanguage] = useState('javascript');

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socketRef = useRef();
  const editorRef = useRef();

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
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Failed to get media stream:', err);
      });

    socketRef.current.on('codeChange', (newCode) => {
      console.log('Received codeChange:', newCode);
      setCode(newCode);
    });

    socketRef.current.on('callUser', (data) => {
      console.log('Receiving call from', data.from);
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socketRef.current.on('userJoined', (userId) => {
      console.log('User joined:', userId);
      setUsersInRoom((prevUsers) => [...prevUsers, userId]);
    });

    // Get existing users in the room
    socketRef.current.emit('getUsersInRoom', roomId);

    socketRef.current.on('usersInRoom', (users) => {
      console.log('Users in room:', users);
      setUsersInRoom(users.filter((id) => id !== socketRef.current.id));
    });

    return () => {
      // Clean up on unmount
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  const configureMonaco = (monacoInstance) => {
    if (language === 'python') {
      monacoInstance.languages.register({ id: 'python' });
      monacoInstance.languages.setMonarchTokensProvider('python', {
        // Basic tokenizer rules for Python
        // Enhanced tokenizer rules for Python with keywords
        tokenizer: {
          root: [
            [/\b(def|class|if|elif|else|for|while|return|import|from|as|print|in|try|except|finally|with|lambda|pass|break|continue|and|or|not|is|None|True|False|main)\b/, 'keyword'],
            [/[a-zA-Z_][\w]*/, 'identifier'],
            [/\d+/, 'number'],
            [/[+\-*/%=<>!]+/, 'operator'],
            [/[{}()\[\]]/, '@brackets'],
            [/[;,.]/, 'delimiter'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*'/, 'string'],
          ],
        },
      });
    }
    // Add configurations for other languages if needed
  };

  const editorDidMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    configureMonaco(monacoInstance);
  };

  // Reconfigure Monaco when the language changes
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      monaco.editor.setModelLanguage(model, language);
      configureMonaco(monaco);
    }
  }, [language]);

  const onCodeChange = (newCode) => {
    setCode(newCode);
    console.log('Emitting codeChange:', newCode);
    socketRef.current.emit('codeChange', { roomId, code: newCode });
  };

  const callUser = (id) => {
    console.log('Calling user:', id);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', (data) => {
      socketRef.current.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
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
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', (data) => {
      socketRef.current.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return (
    <div style={{display: 'flex'}}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
        <option value="python">Python</option>
      </select>

      <MonacoEditor
        width="100%"
        height="80vh"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={onCodeChange}
        editorDidMount={editorDidMount}
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
        }}
      />

      {/* Video Call and Controls */}
      <div style={{width: '50%', padding: '20px'}}>
        {/* Video Streams */}
        <div>
          {stream && (
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              style={{width: '300px'}}
            />
          )}
          {callAccepted && !callEnded && (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              style={{width: '300px'}}
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
            <div key={userId}>
              <span>{userId}</span>
              <button onClick={() => callUser(userId)}>Call</button>
            </div>
          ))}
          {callAccepted && !callEnded && (
            <button onClick={leaveCall}>End Call</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditor;

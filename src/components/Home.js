// Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const createNewRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    navigate(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId.trim() !== '') {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div>
      <h1>Code Interview Platform</h1>
      <button onClick={createNewRoom}>Create New Meeting</button>
      <div>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={joinRoom}>Join Meeting</button>
      </div>
    </div>
  );
};

export default Home;

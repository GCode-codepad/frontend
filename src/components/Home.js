import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Modal.css'; // Import the CSS file
import { VideoCameraFilled, PlusOutlined } from '@ant-design/icons';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Create a new Room and copy the Room ID to the clipboard
  const createNewRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);  // Save the roomId in state (optional)

    // Copy Room ID to clipboard
    navigator.clipboard.writeText(newRoomId).then(() => {
      alert(`Room ID ${newRoomId} has been copied to your clipboard.`);
    }).catch(err => {
      console.error('Failed to copy room ID to clipboard:', err);
    });

    // Navigate to the room
    navigate(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId.trim() !== '' && username.trim() !== '') {
      navigate(`/room/${roomId}`);
    }
  };

  const handleJoinClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-28 w-full max-w-3xl">
          <h1 className="text-4xl font-bold mb-10 text-center">Code Interview Platform</h1>

          <div className="flex flex-row items-center justify-center space-x-8">
            <button
                onClick={createNewRoom}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold w-20 h-20 rounded-2xl flex items-center justify-center transform hover:translate-y-[-5px] hover:shadow-lg transition-all duration-300"
            >
              <VideoCameraFilled className="text-5xl" />
            </button>

            {/* Join Room Button */}
            <button
                onClick={handleJoinClick}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold w-20 h-20 rounded-2xl flex items-center justify-center transform hover:translate-y-[-5px] hover:shadow-lg transition-all duration-300"
            >
              <PlusOutlined className="text-5xl" />
            </button>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2 className="text-2xl mb-4">Join Room</h2>
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder="Enter Your Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                />
                <div className="modal-actions">
                  <button
                      onClick={joinRoom}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Join
                  </button>
                  <button
                      onClick={closeModal}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default Home;

import React, {useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './Modal.css';
import {Avatar, Button} from "antd";
import { VideoCameraFilled, PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import {AuthContext} from "./AuthContext";
import { getAuth, signOut } from "firebase/auth";
import axios from "axios";

const Home = () => {
  const { user, Token, loading } = useContext(AuthContext);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userPhotoURL, setUserPhotoURL] = useState("");

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate("/login");
    } else {
      setUserId(user.uid);
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (userId && Token) {
      getUserPhotoURL(userId);
    }
  }, [userId]);

  // Handle user logout
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
        .then(() => {
          localStorage.removeItem('loginTimestamp');
          navigate("/login");
        })
        .catch((error) => {
          console.error("Error logging out: ", error);
        });
  };

  // Create a new Room and copy the Room ID to the clipboard
  const createNewRoom = () => {
    // if (!user && !Token) {
    //   navigate("/login");
    // } else {
      const newRoomId = Math.random().toString(36).substr(2, 9);
      setRoomId(newRoomId);  // Save the roomId in state

      // Copy Room ID to clipboard
      navigator.clipboard.writeText(newRoomId).then(() => {
        alert(`Room ID ${newRoomId} has been copied to your clipboard.`);
      }).catch(err => {
        console.error('Failed to copy room ID to clipboard:', err);
      });

      navigate(`/room/${newRoomId}`);
    // }
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

  const getUserPhotoURL = async (userId) => {
    try {
      const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/user/users/${userId}`,
          {

          },
      );
      const User = response.data;
      setUserPhotoURL(User.photoURL);
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg w-[800px] h-[500px] p-8 relative">

          {/* Container for title, avatar, and logout */}
          <div className="flex justify-between items-center mb-6">
            {/*<h1 className="text-4xl font-bold">GCCode</h1>*/}
            <img src={`${process.env.PUBLIC_URL}/GCLogo.png`} alt={"tt"} style={{ maxWidth: '50px', maxHeight: '50px' }}/>
            <div className="flex items-center space-x-4">
              <Avatar size={40} src={userPhotoURL}></Avatar>

              <Button
                  type="primary"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  danger
              >
                Logout
              </Button>
            </div>
          </div>

          <div className="flex flex-row items-center justify-center space-x-8 mt-32">
            <button
                onClick={createNewRoom}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold w-20 h-20 rounded-3xl flex items-center justify-center transform hover:translate-y-[-5px] hover:shadow-lg transition-all duration-300"
            >
              <VideoCameraFilled className="text-5xl" />
            </button>

            <button
                onClick={handleJoinClick}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold w-20 h-20 rounded-3xl flex items-center justify-center transform hover:translate-y-[-5px] hover:shadow-lg transition-all duration-300"
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

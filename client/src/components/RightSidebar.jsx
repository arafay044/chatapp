import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import AuthContext from '../../context/AuthContext';

const RightSidebar = () => {
  const { messages, selectedUser } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [messageImages, setMessageImages] = useState([]);

  useEffect(() => {
    setMessageImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  if (!selectedUser) return null;

  return (
    <div className="bg-gray-900/50 text-white w-full hidden md:block relative rounded-l-2xl shadow-lg">
      {/* User Info */}
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt={`${selectedUser.fullName} avatar`}
          className="w-20 aspect-square rounded-full object-cover border-2 border-purple-500 shadow-sm"
        />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
          {selectedUser.fullName}
        </h1>
        <p className="px-10 mx-auto text-center text-gray-300">{selectedUser.bio}</p>
      </div>

      <hr className="border-gray-700/50 my-4" />

      {/* Media Section */}
      <div className="px-5 text-xs">
        <p className="font-semibold mb-2 text-purple-300">Media</p>
        <div className="mt-2 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-4 opacity-90 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
          {messageImages.map((url, index) => (
            <div
              key={index}
              onClick={() => window.open(url)}
              className="cursor-pointer rounded hover:scale-105 transition-transform"
            >
              <img
                src={url}
                alt={`media ${index + 1}`}
                className="h-28 w-full object-cover rounded-md border border-purple-500 shadow-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => logout()}
        aria-label="Logout"
        className="absolute bottom-5 inset-x-0 mx-auto w-max max-w-[90%] bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white text-sm font-medium py-2 px-8 rounded-full cursor-pointer shadow-md hover:shadow-lg transition-all"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;

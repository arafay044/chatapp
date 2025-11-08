import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../../context/ChatContext';

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="min-h-screen w-full flex bg-gray-900 text-white">
      {/* Left Sidebar */}
      <div className={`h-screen ${selectedUser ? 'hidden md:flex' : 'flex'} flex-shrink-0`}>
        <Sidebar />
      </div>

      {/* Chat Container */}
      <div className="flex-1 h-screen overflow-y-auto">
        <ChatContainer />
      </div>

      {/* Right Sidebar */}
      {selectedUser && (
        <div className="h-screen hidden md:flex flex-shrink-0">
          <RightSidebar />
        </div>
      )}
    </div>
  );
};

export default HomePage;

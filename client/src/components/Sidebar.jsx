import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import AuthContext from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  const filteredUsers = users?.filter((user) =>
    user.fullName.toLowerCase().includes(input.toLowerCase())
  );

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-xl h-full p-4 sm:p-5 rounded-r-2xl text-white shadow-inner overflow-y-auto transition-all duration-300 ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Logo & Menu */}
      <div className="pb-4 sm:pb-5">
        <div className="flex items-center justify-between">
          <img src={assets.logo} alt="ChatVerse Logo" className="w-24 sm:w-32 object-contain" />

          <div className="relative">
            <button
              aria-label="Menu"
              className="relative z-10"
              onClick={(e) => {
                const menu = e.currentTarget.nextSibling;
                if (menu) menu.classList.toggle("hidden");
              }}
            >
              <img
                src={assets.menu_icon}
                alt="menu"
                className="h-5 w-5 cursor-pointer hover:scale-110 transition-transform"
              />
            </button>
            <div className="absolute top-full right-0 z-20 w-36 p-3 rounded-md bg-gray-800 border border-gray-700 text-gray-200 hidden shadow-lg">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm py-1 hover:text-white"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-gray-600" />
              <p
                onClick={() => logout()}
                className="cursor-pointer text-sm py-1 hover:text-white"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-gray-800/70 rounded-full flex items-center gap-2 py-2 px-4 mt-4 hover:bg-gray-700/90 transition-colors">
          <img src={assets.search_icon} alt="search" className="w-3 h-3" />
          <input
            type="text"
            placeholder="Search user"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-gray-400 flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Search users"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex flex-col gap-3 mt-3">
        {filteredUsers?.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              key={user._id || index}
              onClick={() => {
                setSelectedUser(user);
                setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
              }}
              role="button"
              aria-label={`Chat with ${user.fullName}`}
              className={`relative flex items-center gap-3 p-2 pl-3 rounded-xl cursor-pointer transition-colors duration-200 ${
                selectedUser?._id === user._id
                  ? "bg-gray-800/50"
                  : "hover:bg-gray-800/30"
              }`}
            >
              <img
                src={user?.profilePic || assets.avatar_icon}
                alt={`${user.fullName} avatar`}
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 shadow-sm"
              />
              <div className="flex flex-col leading-5">
                <p className="text-sm font-medium">{user.fullName}</p>
                <span
                  className={`text-xs ${
                    onlineUsers.includes(user._id)
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                >
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </span>
              </div>

              {/* Notification Badge */}
              {unseenMessages[user._id] > 0 && (
                <span className="absolute top-2 right-2 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-purple-500 text-white font-semibold shadow-md animate-pulse">
                  {unseenMessages[user._id]}
                </span>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-xs mt-2">No users found</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

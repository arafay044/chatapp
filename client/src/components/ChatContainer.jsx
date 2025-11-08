import React, { useEffect, useRef, useContext, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import AuthContext from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { toast } from "react-hot-toast";

const ChatContainer = () => {
  const scrollEnd = useRef();
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full bg-gray-900 rounded-lg">
        <img src={assets.logo_icon} alt="logo" className="w-16" />
        <p className="text-white text-lg font-medium">Chat anytime, anywhere</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative bg-gray-900/50 backdrop-blur-lg rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
        />
        <p className="flex-1 text-white font-semibold flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </p>
        <img
          src={assets.arrow_icon}
          alt="back"
          aria-label="Go back"
          className="md:hidden w-7 cursor-pointer"
          onClick={() => setSelectedUser(null)}
        />
        <img
          src={assets.help_icon}
          alt="help"
          aria-label="Help"
          className="hidden md:inline w-5 cursor-pointer"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
        {messages?.map((msg, index) => {
          const isOwn = msg.senderId === authUser._id;
          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt="sent"
                  className="max-w-[250px] rounded-xl border border-purple-600 shadow-md hover:scale-105 transition-transform"
                />
              ) : (
                <p
                  className={`p-3 max-w-[220px] break-words text-white font-light rounded-xl ${
                    isOwn
                      ? "bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 rounded-br-none"
                      : "bg-gray-700/70 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </p>
              )}
              <div className="flex flex-col items-center text-xs text-gray-300">
                <img
                  src={isOwn ? authUser?.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon}
                  alt="avatar"
                  className="w-7 h-7 rounded-full border border-purple-500"
                />
                <span className="mt-1">{formatMessageTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 p-3 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex-1 flex items-center gap-2 bg-gray-800/50 rounded-full px-3 py-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSendMessage(e); }}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 p-2 rounded-full text-sm"
            aria-label="Type your message"
          />
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
            onChange={handleSendImage}
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="attach"
              className="w-6 cursor-pointer hover:scale-110 transition-transform"
              aria-label="Attach image"
            />
          </label>
        </div>
        <button
          onClick={handleSendMessage}
          aria-label="Send message"
          className="w-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        >
          <img src={assets.send_button} alt="send" />
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;

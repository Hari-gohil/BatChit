// import { useEffect } from "react";
// import { useChat } from "../context/ChatContext";
// import useAuth from "../hooks/useAuth";
// import OnlineStatus from "./OnlineStatus";

// const ChatList = () => {
//   const {
//     chats = [],
//     groups = [],
//     selectedChat,
//     selectedGroup,
//     setSelectedChat,
//     setSelectedGroup,
//   } = useChat();

//   const { user } = useAuth();

//   useEffect(() => {
//   console.log("Groups:", groups);
// }, [groups]);

//   if (!user) return null;

//   return (
//     <div className="bg-white h-full overflow-y-auto">
//       {/* PRIVATE CHATS */}
//       <div>
//         <h2 className="px-4 py-2 font-bold text-gray-600 bg-gray-100">
//           Chats
//         </h2>

//         {chats.map((chat) => {
//           const otherUser = chat.participants?.find(
//             (p) => p._id !== user._id
//           );

//           return (
//             <div
//               key={chat._id}
//               onClick={() => {
//                 setSelectedChat(chat);
//                 setSelectedGroup(null);
//               }}
//               className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
//                 selectedChat?._id === chat._id
//                   ? "bg-blue-50"
//                   : ""
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 <div className="relative">
//                   <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
//                     {otherUser?.name?.charAt(0)?.toUpperCase()}
//                   </div>
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2">
//                     <OnlineStatus userId={otherUser?._id} />

//                     <span className="font-semibold truncate">
//                       {otherUser?.name}
//                     </span>
//                   </div>

//                   <p className="text-sm text-gray-500 truncate">
//                     {chat.lastMessage?.text ||
//                       "No messages yet"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* GROUP CHATS */}
//       <div>
//         <h2 className="px-4 py-2 font-bold text-gray-600 bg-gray-100">
//           Groups
//         </h2>

//         {groups.map((group) => (
//           <div
//             key={group._id}
//             onClick={() => {
//               setSelectedGroup(group);
//               setSelectedChat(null);
//             }}
//             className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
//               selectedGroup?._id === group._id
//                 ? "bg-green-50"
//                 : ""
//             }`}
//           >
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
//                 👥
//               </div>

//               <div className="flex-1 min-w-0">
//                 <h3 className="font-semibold truncate">
//                   {group.groupName}
//                 </h3>

//                 <p className="text-xs text-gray-500">
//                   {group.members?.length || 0} members
//                 </p>

//                 <p className="text-sm text-gray-500 truncate">
//                   {group.description ||
//                     "No description"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* EMPTY STATE */}
//       {chats.length === 0 &&
//         groups.length === 0 && (
//           <div className="p-4 text-center text-gray-500">
//             No chats or groups found
//           </div>
//         )}
//     </div>
//   );
// };

// export default ChatList;

import { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import useAuth from "../hooks/useAuth";
import OnlineStatus from "./OnlineStatus";
import {
  FiSearch,
  FiMessageCircle,
  FiUsers,
  FiChevronRight,
  FiSend,
  FiClock,
  FiMenu,
  FiUser,
  FiLogOut,
  FiPlusCircle,
} from "react-icons/fi";
import { MdOutlineGroups, MdOutlineMessage } from "react-icons/md";
import { BsCheck2All, BsCheck2 } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { deleteChat } from "../services/chatService";
import toast from "react-hot-toast";

const ChatList = () => {
  const {
    chats = [],
    groups = [],
    selectedChat,
    selectedGroup,
    setSelectedChat,
    setSelectedGroup,
  } = useChat();

  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("all"); // all, chats, groups

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format last message time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (diff < 604800000)
      return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Filter chats based on search and section
  const getFilteredChats = () => {
    let filteredChats = chats;
    let filteredGroups = groups;

    if (searchTerm) {
      filteredChats = chats.filter((chat) => {
        const otherUser = chat.participants?.find((p) => p._id !== user?._id);
        return (
          otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.lastMessage?.text
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });

      filteredGroups = groups.filter(
        (group) =>
          group.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return { filteredChats, filteredGroups };
  };

  const { filteredChats, filteredGroups } = getFilteredChats();
  const showChats = activeSection === "all" || activeSection === "chats";
  const showGroups = activeSection === "all" || activeSection === "groups";

  if (!user) return null;

  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-slate-50 relative border-r border-slate-200/60">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-20">
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
                Messages
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {chats.length + groups.length} total conversations
              </p>
            </div>

            <div ref={menuRef} className="relative">
              {/* Menu Trigger */}
              <div
                onClick={() => setShowMenu(!showMenu)}
                className="relative cursor-pointer group p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <FiMenu className="text-2xl text-slate-700 group-hover:text-indigo-600 transition-colors" />
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>

              {/* Dropdown */}
              {showMenu && (
                <div className="absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden origin-top-right animate-fadeIn">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => { navigate("/Profile"); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <FiUser className="text-lg text-slate-400 group-hover:text-indigo-500" /> Profile
                    </button>

                    <button
                      onClick={() => { navigate("/create-group"); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <FiUsers className="text-lg text-slate-400 group-hover:text-indigo-500" /> Create Group
                    </button>

                    <button
                      onClick={() => { navigate("/create-chat"); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <FiPlusCircle className="text-lg text-slate-400 group-hover:text-indigo-500" /> New Chat
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <button 
                      onClick={logout} 
                      className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 rounded-xl transition-all"
                    >
                      <FiLogOut className="text-lg" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-2 group">
            <FiSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-300 transition-all text-sm text-slate-700 shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div className="w-5 h-5 rounded-full bg-slate-300 text-white flex items-center justify-center text-xs hover:bg-slate-400 transition-colors">
                  ×
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSection("all")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeSection === "all"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 translate-y-[-1px]"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveSection("chats")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeSection === "chats"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 translate-y-[-1px]"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <FiMessageCircle className={`w-4 h-4 ${activeSection === "chats" ? "text-white" : "text-slate-400"}`} />
            Chats
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeSection === "chats" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
              {chats.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection("groups")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeSection === "groups"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 translate-y-[-1px]"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <MdOutlineGroups className={`w-4 h-4 ${activeSection === "groups" ? "text-white" : "text-slate-400"}`} />
            Groups
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeSection === "groups" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
              {groups.length}
            </span>
          </button>
        </div>
      </div>

      {/* Chat List Container */}
      <div className="flex-1 overflow-y-auto">
        {/* PRIVATE CHATS SECTION */}
        {showChats && filteredChats.length > 0 && (
          
          <div className="mb-4">
            {activeSection === "all" && (
              <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 px-5 py-2">
                <div className="flex items-center gap-2">
                  <FiMessageCircle className="w-4 h-4 text-blue-500" />
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Private Chats
                  </h2>
                  <span className="text-xs text-gray-400">
                    ({filteredChats.length})
                  </span>
                </div>
              </div>
            )}

            {filteredChats.map((chat, index) => {
              const otherUser = chat.participants?.find(
                (p) => p._id !== user._id,
              );
              const unreadCount = chat.unreadCount || 0;
              const lastMessage = chat.lastMessage;
              const isSelected = selectedChat?._id === chat._id;

              return (
                <div
                  key={chat._id}
                  onClick={() => {
                     setSelectedChat(chat);
                     setSelectedGroup(null);
                  }}
                  className={`
                    relative mx-3 mb-2 p-3 rounded-2xl cursor-pointer
                    transition-all duration-300 ease-out border
                    hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5
                    ${
                      isSelected
                        ? "bg-white border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                        : "bg-transparent border-transparent hover:bg-white"
                    }
                    animate-slideIn
                  `}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"></div>}
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ring-2
                        ${
                          isSelected
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 ring-indigo-100"
                            : "bg-gradient-to-br from-slate-400 to-slate-500 ring-transparent"
                        }
                      `}
                      >
                        {otherUser?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <OnlineStatus userId={otherUser?._id} />
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold truncate ${isSelected ? "text-blue-900" : "text-gray-800"}`}
                          >
                            {otherUser?.name || "Unknown User"}
                          </span>
                          {unreadCount > 0 && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {formatTime(lastMessage?.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          {lastMessage?.senderId === user._id &&
                            (lastMessage?.status === "read" ? (
                              <BsCheck2All className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            ) : (
                              <BsCheck2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            ))}
                          <p
                            className={`text-sm truncate ${
                              unreadCount > 0
                                ? "text-slate-800 font-semibold"
                                : "text-slate-500"
                            }`}
                          >
                            {lastMessage?.text || "No messages yet"}
                          </p>
                        </div>

                        {unreadCount > 0 && (
                          <div className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </div>
                        )}
                      </div>
                    </div>

                    <FiChevronRight
                      className={`w-5 h-5 transition-transform ${
                        isSelected
                          ? "text-indigo-500 translate-x-1"
                          : "text-slate-300 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* GROUP CHATS SECTION */}
        {showGroups && filteredGroups.length > 0 && (
          <div className="mb-4">
            {activeSection === "all" && (
              <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 px-5 py-2">
                <div className="flex items-center gap-2">
                  <MdOutlineGroups className="w-4 h-4 text-green-500" />
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Group Chats
                  </h2>
                  <span className="text-xs text-gray-400">
                    ({filteredGroups.length})
                  </span>
                </div>
              </div>
            )}

            {filteredGroups.map((group, index) => {
              const isSelected = selectedGroup?._id === group._id;

              return (
                <div
                  key={group._id}
                  onClick={() => {
                    setSelectedGroup(group);
                    setSelectedChat(null);
                  }}
                  className={`
                    relative mx-3 mb-2 p-3 rounded-2xl cursor-pointer
                    transition-all duration-300 ease-out border
                    hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5
                    ${
                      isSelected
                        ? "bg-white border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                        : "bg-transparent border-transparent hover:bg-white"
                    }
                    animate-slideIn
                  `}
                  style={{
                    animationDelay: `${(filteredChats.length + index) * 30}ms`,
                  }}
                >
                  {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full"></div>}
                  <div className="flex items-center gap-3">
                    {/* Group Avatar */}
                    <div
                      className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm
                      ${
                        isSelected
                          ? "bg-gradient-to-br from-green-500 to-emerald-600"
                          : "bg-gradient-to-br from-gray-400 to-gray-500"
                      }
                    `}
                    >
                      {group.groupAvatar ? (
                        <img
                          src={group.groupAvatar}
                          alt={group.groupName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        "👥"
                      )}
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold truncate ${isSelected ? "text-green-900" : "text-gray-800"}`}
                        >
                          {group.groupName}
                        </h3>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiUsers className="w-3 h-3" />
                          {group.members?.length || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate flex-1">
                          {group.lastMessage?.text ||
                            group.description ||
                            "No messages yet"}
                        </p>
                        {group.unreadCount > 0 && (
                          <div className="ml-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                            {group.unreadCount > 99 ? "99+" : group.unreadCount}
                          </div>
                        )}
                      </div>

                      {/* Last message time if exists */}
                      {group.lastMessage?.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(group.lastMessage.timestamp)}
                        </p>
                      )}
                    </div>

                    <FiChevronRight
                      className={`w-5 h-5 transition-transform ${
                        isSelected
                          ? "text-emerald-500 translate-x-1"
                          : "text-slate-300 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EMPTY STATE */}
        {filteredChats.length === 0 && filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 relative overflow-hidden">
             <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center]"></div>
            <div className="w-28 h-28 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10 animate-bounce-slow">
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping opacity-75"></div>
              {searchTerm ? (
                <FiSearch className="w-12 h-12 text-indigo-400" />
              ) : (
                <MdOutlineMessage className="w-12 h-12 text-indigo-400 translate-y-1" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 z-10 tracking-tight">
              {searchTerm ? "No results found" : "No conversations yet"}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs z-10 font-medium">
              {searchTerm
                ? `No chats or groups match "${searchTerm}"`
                : "Start a new conversation or create a group to get started"}
            </p>
            {!searchTerm && (
              <button className="mt-8 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 font-semibold z-10 group">
                <FiSend className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                New Conversation
              </button>
            )}
          </div>
        )}
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ChatList;

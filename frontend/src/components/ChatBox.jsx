import { useEffect, useState, useRef } from "react";
import { socket } from "../socket/socket.js";
import EmojiPicker from "./EmojiPicker";
import MessageBubble from "./MessageBubble";
import { useChat } from "../context/ChatContext";
import { useSocket } from "../context/SocketContext";
import { getMessages, getGroupMessages, sendMessage } from "../services/messageService";
import useAuth from "../hooks/useAuth";
import { deleteChat } from "../services/chatService.js";
import toast from "react-hot-toast";
import { deleteGroup, leaveGroup } from "../services/groupService.js";
import { deleteMessage, deleteAllMessages } from "../services/messageService";
import { FiMoreVertical, FiPhone, FiVideo, FiTrash2, FiLogOut, FiUsers, FiSend, FiPaperclip, FiX, FiInfo, FiMail, FiArrowLeft } from "react-icons/fi";
import { Element, scroller } from "react-scroll";
const ChatBox = () => {
  const { selectedChat, selectedGroup, setSelectedGroup, setSelectedChat } = useChat();
  const { onlineUsers } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 150 * 1024 * 1024) {
        return toast.error("File size exceeds 150MB limit");
      }
      setAttachment(file);
      setAttachmentPreview(URL.createObjectURL(file));
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const scrollToBottom = () => {
    scroller.scrollTo("messages-bottom", {
      duration: 600,
      delay: 0,
      smooth: "easeInOutCubic",
      containerId: "messages-container",
    });
  };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);
  useEffect(() => {
  if (messages.length) {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }
}, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (selectedChat) {
          const data = await getMessages(selectedChat._id);
          setMessages(data);
        }
        if (selectedGroup) {
          const data = await getGroupMessages(selectedGroup._id);
          setMessages(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    loadMessages();
  }, [selectedChat, selectedGroup]);

  useEffect(() => {
    if (!selectedChat || !messages.length) return;
    // Only check the last 20 messages for performance, usually unseen are recent
    const recentMessages = messages.slice(-20);
    recentMessages.forEach((msg) => {
      if (msg.receiver?._id === user._id && msg.status !== "seen") {
        socket.emit("message_seen", {
          messageId: msg._id,
          senderId: msg.sender?._id,
        });
      }
    });
  }, [messages, selectedChat, user]);

  useEffect(() => {
    const handleReceive = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };
    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, []);

  useEffect(() => {
    socket.on("connect", () => {});
    socket.on("disconnect", () => console.log("🔴 Disconnected"));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    const handleDelivered = (messageId) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, status: "delivered" } : msg))
      );
    };
    const handleSeen = (messageId) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, status: "seen" } : msg))
      );
    };
    socket.on("message_delivered", handleDelivered);
    socket.on("message_seen", handleSeen);
    return () => {
      socket.off("message_delivered", handleDelivered);
      socket.off("message_seen", handleSeen);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return;
    try {
      let newMessage;
      
      const formData = new FormData();
      if (text.trim()) formData.append("text", text);
      if (attachment) formData.append("file", attachment);

      if (selectedChat) {
        const otherUser = selectedChat.participants.find((p) => p._id !== user._id);
        formData.append("chatId", selectedChat._id);
        formData.append("receiverId", otherUser._id);
        
        newMessage = await sendMessage(formData);
        
        socket.emit("send_message", {
          messageId: newMessage._id,
          senderId: user._id,
          receiverId: otherUser._id,
        });
        socket.emit("new_message", newMessage);
      }
      if (selectedGroup) {
        formData.append("groupId", selectedGroup._id);
        newMessage = await sendMessage(formData);
      }
      setMessages((prev) => [...prev, newMessage]);
      setText("");
      removeAttachment();
      // Keep focus on input after sending to prevent mobile keyboard from closing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.log(error);
      toast.error("Failed to send message");
    }
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  if (!selectedChat && !selectedGroup) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-bottom"></div>
        <div className="w-28 h-28 bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-full flex items-center justify-center shadow-inner mb-6 relative animate-bounce-slow">
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping opacity-75"></div>
          <FiSend className="text-5xl text-indigo-400 translate-x-[-2px] translate-y-[2px]" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight z-10">Your Messages</h3>
        <p className="text-sm text-slate-500 mt-2 font-medium z-10">Select a chat or start a new conversation</p>
      </div>
    );
  }

  const handleDelete = async (chatId) => {
    try {
      await deleteChat(chatId);
      toast.success("Chat deleted");
      window.location.reload(); 
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      toast.success("Group deleted");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(selectedGroup._id);
      toast.success("You left the group");
      setSelectedGroup(null);
      setMessages([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleDeleteAllMessages = async () => {
    try {
      await deleteAllMessages(selectedChat._id);
      setMessages([]);
      toast.success("All messages deleted");
      setShowDropdown(false);
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const otherUser = selectedChat?.participants.find((p) => p._id !== user._id);
  const headerTitle = selectedGroup ? selectedGroup.groupName : otherUser?.name;
  const isOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* HEADER */}
      <div className="px-4 md:px-6 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-md flex items-center justify-between shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            className="md:hidden p-2 -ml-2 mr-1 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            onClick={() => {
              setSelectedChat(null);
              setSelectedGroup(null);
            }}
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div className="flex items-center gap-3 md:gap-4 group cursor-pointer" onClick={() => setShowProfile(true)}>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold text-white shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 relative ring-2 ring-white group-hover:scale-105 transition-transform flex-shrink-0">
               {selectedGroup ? <FiUsers /> : headerTitle?.charAt(0).toUpperCase()}
               {!selectedGroup && isOnline && <span className="absolute bottom-0 right-0 w-3 md:w-3.5 h-3 md:h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></span>}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-slate-800 text-base md:text-lg tracking-tight group-hover:text-indigo-600 transition-colors truncate">{headerTitle}</h2>
              {selectedGroup ? (
                <p className="text-xs text-slate-500 font-medium">{selectedGroup.members.length} members</p>
              ) : (
                isOnline && <p className="text-xs text-emerald-500 font-medium">Online</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
         <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className={`p-2.5 rounded-full transition-colors ${showDropdown ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
            >
              <FiMoreVertical className="text-lg" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-12 w-48 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fadeIn origin-top-right">
                {selectedChat && (
                   <>
                     <button onClick={handleDeleteAllMessages} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"><FiTrash2 className="text-slate-400" /> Clear Chat</button>
                     <button onClick={() => handleDelete(selectedChat._id)} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"><FiTrash2 /> Delete Chat</button>
                   </>
                )}
                {selectedGroup && (
                   <>
                     <button onClick={handleLeaveGroup} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"><FiLogOut className="text-slate-400" /> Leave Group</button>
                     {selectedGroup.admin?._id === user._id && (
                       <button onClick={() => handleDeleteGroup(selectedGroup._id)} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"><FiTrash2 /> Delete Group</button>
                     )}
                   </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div id="messages-container" className="flex-1 p-6 overflow-y-auto bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div className="space-y-2">
          {messages.map((message) => (
            <MessageBubble
              key={message._id}
              messageId={message._id}
              own={message.sender?._id === user._id}
              message={message.text}
              image={message.image}
              video={message.video}
              createdAt={message.createdAt}
              sender={message.sender}
              status={message.status}
              onDelete={handleDeleteMessage}
            />
          ))}
          <Element name="messages-bottom" />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white/80 backdrop-blur-lg border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)] relative">
        {attachmentPreview && (
          <div className="absolute bottom-full left-4 mb-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 flex items-start gap-2 z-30 animate-slideIn">
            {attachment?.type.startsWith("video/") ? (
              <video src={attachmentPreview} className="h-20 w-auto rounded-lg" />
            ) : (
              <img src={attachmentPreview} alt="Preview" className="h-20 w-auto rounded-lg object-cover" />
            )}
            <button 
              type="button" 
              onClick={removeAttachment}
              className="p-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-colors"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        )}
        {user?.isBlocked ? (
          <div className="w-full py-4 text-center text-rose-500 font-semibold bg-rose-50 rounded-2xl border border-rose-100">
            You are blocked from sending messages.
          </div>
        ) : (
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3 relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,video/*"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 sm:p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors mb-0.5"
            >
              <FiPaperclip className="text-xl" />
            </button>
            
            <div className="flex-1 bg-slate-100/50 rounded-3xl flex items-end px-2 py-1.5 border border-slate-200 focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-md focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300 relative group">
              <div className="pb-1 pl-1 opacity-60 hover:opacity-100 transition-opacity"><EmojiPicker onEmojiSelect={handleEmojiSelect} /></div>
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                className="w-full bg-transparent max-h-32 min-h-[44px] py-3 px-3 outline-none text-sm text-slate-800 resize-none scrollbar-thin scrollbar-thumb-slate-200"
                placeholder={selectedGroup ? "Message group..." : "Type a message..."}
                rows={1}
              />
            </div>

            <button
              type="submit"
              disabled={!text.trim() && !attachment}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none text-white p-3.5 rounded-full shadow-[0_4px_14px_0_rgb(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0 group mb-0.5"
            >
              <FiSend className="text-lg translate-x-[-1px] translate-y-[1px] group-hover:scale-110 transition-transform" />
            </button>
          </form>
        )}
      </div>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowProfile(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden z-10 animate-slideIn transform transition-all relative flex flex-col">
            <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
              <button 
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 relative ring-4 ring-white -mt-12 mb-4">
                {selectedGroup ? (
                   selectedGroup.groupAvatar ? (
                     <img src={selectedGroup.groupAvatar} alt={selectedGroup.groupName} className="w-full h-full rounded-full object-cover" />
                   ) : <FiUsers />
                ) : headerTitle?.charAt(0).toUpperCase()}
                {!selectedGroup && <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm"></span>}
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center">{headerTitle}</h2>
              {selectedGroup ? (
                <p className="text-sm text-slate-500 font-medium mb-6">{selectedGroup.members.length} members</p>
              ) : (
                <p className="text-sm text-emerald-500 font-medium mb-6">Online</p>
              )}

              <div className="w-full space-y-3">
                {selectedGroup ? (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start gap-3">
                    <FiInfo className="text-indigo-500 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
                      <p className="text-sm text-slate-700">{selectedGroup.description || "No description provided."}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                    <FiMail className="text-indigo-500 text-xl flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</h4>
                      <p className="text-sm text-slate-700 font-medium">{otherUser?.email || "Email address hidden"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatBox;

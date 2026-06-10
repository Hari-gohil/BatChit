import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../hooks/useAuth";
import { useChat } from "../context/ChatContext";
import { getUsers } from "../services/userService";
import { createChat } from "../services/chatService";
import { FiMessageSquare, FiSearch, FiUser } from "react-icons/fi";

const CreateChat = () => {
  const { token, user } = useAuth();
  const { fetchChats, setSelectedChat } = useChat();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers(token);
      const filteredUsers = data.filter((u) => u._id !== user._id);
      setUsers(filteredUsers);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateChat = async (receiverId) => {
    try {
      setLoading(true);
      const newChat = await toast.promise(createChat(receiverId, token), {
        loading: "Opening chat...",
        success: "Chat ready",
        error: "Failed to create chat",
      });
      await fetchChats();
      setSelectedChat(newChat);
      navigate(`/`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiMessageSquare className="text-blue-600" /> Start New Chat
          </h2>
          <p className="text-gray-500 text-sm mt-1">Select a contact to begin a conversation</p>
          
          <div className="mt-4 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="p-2">
          {filteredUsers.length === 0 ? (
             <div className="p-8 text-center text-gray-500">
               <FiUser className="mx-auto text-4xl mb-2 opacity-50" />
               <p>No contacts found.</p>
             </div>
          ) : (
            <div className="space-y-1 max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
              {filteredUsers.map((u) => (
                <div
                  key={u._id}
                  onClick={() => !loading && handleCreateChat(u._id)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : 'hover:bg-blue-50 hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{u.name}</h3>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white border border-gray-200 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shadow-sm">
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateChat;
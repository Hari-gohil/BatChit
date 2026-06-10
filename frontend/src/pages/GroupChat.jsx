import { useParams } from "react-router-dom";
import { FiSend, FiMoreVertical, FiImage, FiPaperclip, FiSmile, FiUsers } from "react-icons/fi";

const GroupChat = () => {
  const { groupId } = useParams();

  // Temporary mock data for UI visualization
  const mockMessages = [
    { id: 1, sender: "Alice", text: "Hey everyone! Welcome to the new group.", time: "10:00 AM", isMe: false },
    { id: 2, sender: "Bob", text: "Glad to be here!", time: "10:02 AM", isMe: false },
    { id: 3, sender: "You", text: "Hello! What's the plan for today?", time: "10:05 AM", isMe: true },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            <FiUsers />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Group Chat Name</h2>
            <p className="text-xs text-gray-500 font-medium">Participants • ID: {groupId.substring(0,6)}...</p>
          </div>
        </div>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
          <FiMoreVertical className="text-xl" />
        </button>
      </header>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center">
          <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Today</span>
        </div>

        {mockMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
              {!msg.isMe && <span className="text-xs text-gray-500 ml-1 mb-1 font-medium">{msg.sender}</span>}
              <div 
                className={`px-4 py-3 rounded-2xl shadow-sm ${
                  msg.isMe 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 mx-1">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button className="text-gray-400 hover:text-blue-600 transition-colors p-2"><FiPaperclip className="text-xl" /></button>
          <button className="text-gray-400 hover:text-blue-600 transition-colors p-2 hidden sm:block"><FiImage className="text-xl" /></button>
          
          <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all shadow-inner">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="w-full bg-transparent py-3 outline-none text-sm text-gray-800"
            />
            <button className="text-gray-400 hover:text-yellow-500 transition-colors p-1"><FiSmile className="text-xl" /></button>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95">
            <FiSend className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
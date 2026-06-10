import { useSocket } from "../context/SocketContext";
import useAuth from "../hooks/useAuth";
import { FiMonitor } from "react-icons/fi";

const OnlineUsers = () => {
  const { onlineUsers } = useSocket();
  const { users } = useAuth();

  const activeUsers = users.filter((user) => onlineUsers.includes(user._id));

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <FiMonitor className="text-blue-600" />
        <h2 className="font-semibold text-gray-800">Active Now</h2>
        <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {activeUsers.length}
        </span>
      </div>

      {activeUsers.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No one is online</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
          {activeUsers.map((user) => (
            <div key={user._id} className="flex flex-col items-center gap-1 min-w-[60px]">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center font-bold text-blue-600 shadow-sm border-2 border-transparent hover:border-blue-200 transition-colors cursor-pointer">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 shadow-sm animate-pulse" />
              </div>
              <p className="text-xs text-gray-600 font-medium truncate w-full text-center">
                {user.name.split(" ")[0]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnlineUsers;

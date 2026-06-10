import { useSocket } from "../context/SocketContext";

const OnlineStatus = ({ userId, inline = false }) => {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.includes(userId);

  return (
    <span
      className={`${inline ? 'relative inline-block' : 'absolute bottom-0 right-0'} h-3 w-3 md:h-3.5 md:w-3.5 rounded-full border-2 border-white shadow-sm transition-colors duration-300 ${
        isOnline ? "bg-green-500 animate-pulse" : "bg-gray-300"
      }`}
    />
  );
};

export default OnlineStatus;
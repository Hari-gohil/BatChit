import { BsCheck2All, BsCheck2 } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";

const MessageBubble = ({
  messageId,
  message,
  image,
  video,
  own,
  createdAt,
  sender,
  status,
  onDelete,
}) => {
  const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";
  return (
    <div className={`group flex mb-4 ${own ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col ${own ? "items-end" : "items-start"} max-w-[75%] md:max-w-[60%]`}>
        
        {/* Sender Name for Group Chats (Not own) */}
        {!own && sender && (
          <span className="text-xs text-gray-500 ml-12 mb-1 font-medium">
            {sender.name}
          </span>
        )}

        <div className={`flex items-end gap-2 ${own ? "flex-row-reverse" : "flex-row"}`}>
          {/* Avatar for others */}
          {!own && sender && (
            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 text-xs font-bold flex items-center justify-center mb-1 shadow-sm">
              {sender.name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div
            className={`
              relative px-4 py-2.5 shadow-sm
              ${
                own
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-sm"
                  : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm"
              }
            `}
          >
            {image && (
              <div className="mb-2 max-w-[240px] md:max-w-[320px]">
                <img src={`${backendUrl}${image}`} alt="Attachment" className="w-full h-auto rounded-lg shadow-sm" />
              </div>
            )}
            
            {video && (
              <div className="mb-2 max-w-[240px] md:max-w-[320px]">
                <video controls src={`${backendUrl}${video}`} className="w-full h-auto rounded-lg shadow-sm" />
              </div>
            )}

            {message && <p className="text-[15px] leading-relaxed break-words">{message}</p>}

            <div
              className={`flex items-center justify-end gap-1.5 text-[10px] mt-1.5 font-medium ${
                own ? "text-blue-100" : "text-gray-400"
              }`}
            >
              <span>
                {new Date(createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {own && (
                <span className="text-sm -mb-0.5">
                  {status === "sent" && <BsCheck2 className="text-blue-200" />}
                  {status === "delivered" && <BsCheck2All className="text-white" />}
                  {status === "seen" && <BsCheck2All className="text-yellow-300" />}
                </span>
              )}
            </div>
          </div>

          {/* Delete Button (Hover) */}
          {own && (
            <button
              onClick={() => onDelete(messageId)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full flex-shrink-0"
              title="Delete message"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

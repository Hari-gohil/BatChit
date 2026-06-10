import { useState, useRef, useEffect } from "react";
import Picker from "emoji-picker-react";
import { FiSmile } from "react-icons/fi";

const EmojiPicker = ({ onEmojiSelect }) => {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData) => {
    onEmojiSelect(emojiData.emoji);
  };

  return (
    <div className="relative flex items-center" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`p-2 rounded-full transition-colors ${open ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-blue-500 hover:bg-gray-100"}`}
      >
        <FiSmile className="text-xl" />
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 z-50 animate-fadeIn shadow-2xl rounded-lg overflow-hidden border border-gray-100">
          <Picker
            onEmojiClick={handleEmojiClick}
            height={350}
            width={300}
            searchPlaceholder="Search emojis..."
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
          />
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default EmojiPicker;
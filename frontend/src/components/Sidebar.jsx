import {
  FaComments,
  FaUser,
  FaCog,
} from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r h-full">
      <div className="p-4 font-bold text-lg">
        Menu
      </div>

      <nav className="flex flex-col">

        <button className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100">
          <FaComments />
          Chats
        </button>

        <button className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100">
          <FaUser />
          Profile
        </button>

        <button className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100">
          <FaCog />
          Settings
        </button>

      </nav>
    </aside>
  );
};

export default Sidebar;
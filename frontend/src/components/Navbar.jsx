import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-xl font-bold text-blue-600">
        Chat App
      </h1>

      <div className="flex items-center gap-4">
        <span className="font-medium">
          {user?.name}
        </span>

        <button
          onClick={logout}
          className="bg-[#F76808] text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
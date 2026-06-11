import { useEffect, useState, useContext } from "react";
import {
  getDashboardStats,
  getAllUsers,
  getAllGroups,
  blockUser,
  unblockUser,
  deleteUser,
  deleteGroup,
  removeMemberFromGroup,
} from "../services/adminService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiMessageSquare,
  FiActivity,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiTrendingUp,
  FiGrid,
  FiLogOut,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiArrowLeft,
  FiLayers,
  FiUser,
  FiCpu,
  FiDatabase,
  FiMail,
} from "react-icons/fi";
import { socket } from "../socket/socket";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, groups
  const [roleFilter, setRoleFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
  socket.on("online-users-count", (count) => {
    setOnlineUsersCount(count);
  });

  return () => {
    socket.off("online-users-count");
  };
}, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const statsData = await getDashboardStats();
      const usersData = await getAllUsers();
      const groupsData = await getAllGroups();

      setStats(statsData || {});
      setUsers(usersData || []);
      setGroups(groupsData || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = async (id, name) => {
    try {
      await blockUser(id);
      toast.success(`User "${name}" Blocked`);
      loadData();
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  const handleUnblock = async (id, name) => {
    try {
      await unblockUser(id);
      toast.success(`User "${name}" Unblocked`);
      loadData();
    } catch (error) {
      toast.error("Failed to unblock user");
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      try {
        await deleteUser(id);
        toast.success(`User "${name}" Deleted`);
        loadData();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleDeleteGroup = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete group "${name}"? This action cannot be undone.`)) {
      try {
        await deleteGroup(id);
        toast.success(`Group "${name}" Deleted`);
        loadData();
      } catch (error) {
        toast.error("Failed to delete group");
      }
    }
  };

  const handleRemoveMember = async (groupId, userId, userName) => {
    if (window.confirm(`Are you sure you want to remove user "${userName}" from this group?`)) {
      try {
        await removeMemberFromGroup(groupId, userId);
        toast.success(`User "${userName}" removed from group`);
        loadData();
      } catch (error) {
        toast.error("Failed to remove user from group");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const getUserInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "all" ? true : (u.role || "user") === roleFilter;
    return matchesSearch && matchesRole;
  });

  // filter groups
  const filteredGroups = groups.filter((g) =>
    g.groupName?.toLowerCase().includes(groupSearch.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-full shadow-2xl lg:shadow-sm transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div>
          {/* Sidebar Brand/Logo */}
          <div className="p-6 border-b border-slate-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FiShield className="text-white text-lg" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">ChatApp</h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
              }`}
            >
              <FiGrid className="text-lg" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
              }`}
            >
              <FiUsers className="text-lg" />
              <span>Users</span>
            </button>

            <button
              onClick={() => setActiveTab("groups")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "groups"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
              }`}
            >
              <FiLayers className="text-lg" />
              <span>Groups</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer (Profile Info & Logout/Back) */}
        <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/50">
          {user && (
            <div className="flex items-center space-x-3 px-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-600">
                {getUserInitials(user.name)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="grid">

            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white hover:border-rose-500 text-xs font-semibold transition-all duration-150 shadow-sm"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 w-full">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-10 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight capitalize truncate">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "users" && "User Management"}
              {activeTab === "groups" && "Group Management"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={loadData}
              disabled={isLoading}
              className={`p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-200 shadow-sm cursor-pointer ${
                isLoading ? "animate-spin text-indigo-500 animate-duration-1000" : ""
              }`}
              title="Refresh Data"
            >
              <FiRefreshCw />
            </button>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center shadow-sm" title="Backend Connected">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {isLoading && users.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 text-sm font-medium animate-pulse">Fetching latest statistics...</p>
            </div>
          ) : (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Tab 1: OVERVIEW */}
              {activeTab === "overview" && (
                <>
                  {/* Welcome Banner */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-8 shadow-xl shadow-indigo-600/20">
                    <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8 pointer-events-none">
                      <FiShield className="text-[180px] text-white" />
                    </div>
                    <div className="relative z-10 space-y-2">
                      <h3 className="text-2xl font-bold text-white">Welcome back, Admin!</h3>
                      <p className="text-indigo-100 max-w-xl text-sm leading-relaxed">
                        Manage your messaging platform, inspect overall status statistics, moderate user behavior, and audit active groups.
                      </p>
                      <div className="pt-2 flex items-center space-x-4 text-xs text-indigo-200 font-semibold">
                        <span>Current System Time: {new Date().toLocaleTimeString()}</span>
                        <span>•</span>
                        <span>Environment: Production</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    {/* User Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center space-x-4 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                      <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                        <FiUsers className="text-xl" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Users</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.totalUsers ?? 0}</p>
                      </div>
                    </div>

                    {/* Online Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center space-x-4 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100 relative">
                        <FiActivity className="text-xl" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-ping"></span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Online Users</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{onlineUsersCount}</p>
                      </div>
                    </div>

                    {/* Chats Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center space-x-4 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
                      <div className="p-3 bg-violet-50 rounded-xl text-violet-600 border border-violet-100">
                        <FiMessageSquare className="text-xl" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Chats</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.totalChats ?? 0}</p>
                      </div>
                    </div>

                    {/* Groups Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center space-x-4 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300">
                      <div className="p-3 bg-sky-50 rounded-xl text-sky-600 border border-sky-100">
                        <FiLayers className="text-xl" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Groups</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.totalGroups ?? 0}</p>
                      </div>
                    </div>

                    {/* Messages Stat */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center space-x-4 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300">
                      <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
                        <FiMail className="text-xl" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Messages</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.totalMessages ?? 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Online Users Section */}
                  {users.filter(u => u.isOnline).length > 0 && (
                    <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                        Active Online Users
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {users.filter(u => u.isOnline).map((u, idx) => (
                          <div key={`${u._id}-${idx}`} className="flex items-center space-x-4 p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                              {getUserInitials(u.name)}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold text-slate-900 truncate">{u.name} <span className="text-xs font-normal text-slate-500 capitalize">({u.role || "user"})</span></p>
                              <p className="text-xs text-slate-500 truncate">{u.email}</p>
                              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Online</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Tab 2: USERS */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {/* Actions Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-full sm:w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 text-sm">
                          <FiSearch />
                        </span>
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          className="pl-10 pr-4 py-2.5 w-full rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-sm"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                      </div>
                      <select
                        className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-sm"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      Showing {filteredUsers.length} of {users.length} registered users
                    </div>
                  </div>

                  

                  {/* Users Table */}
                  {filteredUsers.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
                      <FiUsers className="text-4xl mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-medium">No users found matching "{userSearch}"</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                              <th className="px-6 py-4">User Info</th>
                              <th className="px-6 py-4">Role</th>
                              <th className="px-6 py-4">Email Address</th>
                              <th className="px-6 py-4">Account Status</th>
                              <th className="px-6 py-4 text-right">Administrative Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user, idx) => (
                              <tr
                                key={`${user._id}-${idx}`}
                                className="hover:bg-slate-50 transition-colors duration-150 group"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20">
                                      {getUserInitials(user.name)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {user.name}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                                        ID: {user._id?.substring(0, 8)}...
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium capitalize">
                                  {user.role || "user"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {user.isBlocked ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                      Blocked
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                      Active
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                  {user.isBlocked ? (
                                    <button
                                      onClick={() => handleUnblock(user._id, user.name)}
                                      className="inline-flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-500 border border-emerald-200 text-emerald-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
                                    >
                                      <FiUnlock />
                                      <span>Unblock</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleBlock(user._id, user.name)}
                                      className="inline-flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-500 border border-amber-200 text-amber-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
                                    >
                                      <FiLock />
                                      <span>Block</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                    className="inline-flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-500 border border-rose-200 text-rose-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
                                  >
                                    <FiTrash2 />
                                    <span>Delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: GROUPS */}
              {activeTab === "groups" && (
                <div className="space-y-6">
                  {/* Actions Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 text-sm">
                        <FiSearch />
                      </span>
                      <input
                        type="text"
                        placeholder="Search groups by name..."
                        className="pl-10 pr-4 py-2.5 w-full rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-sm"
                        value={groupSearch}
                        onChange={(e) => setGroupSearch(e.target.value)}
                      />
                    </div>
                    <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      Showing {filteredGroups.length} of {groups.length} active groups
                    </div>
                  </div>

                  {/* Groups Cards Grid */}
                  {filteredGroups.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
                      <FiLayers className="text-4xl mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-medium">No groups found matching "{groupSearch}"</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredGroups.map((group, idx) => (
                         <div
                          key={`${group._id}-${idx}`}
                          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group"
                        >
                          <div className="space-y-4">
                            {/* Group Card Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-sky-500/20">
                                  {getUserInitials(group.groupName)}
                                </div>
                                <div className="overflow-hidden">
                                  <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                    {group.groupName}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    ID: {group._id?.substring(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Details List */}
                            <div className="border-t border-slate-100 pt-4 space-y-2.5">
                              <div className="flex items-center text-xs text-slate-600 font-medium">
                                <FiUser className="mr-2 text-slate-400 text-sm" />
                                <span className="text-slate-500 mr-1.5">Admin:</span>
                                <span className="text-slate-700 font-semibold truncate">{group.admin?.name || "None"}</span>
                              </div>
                              <div className="flex flex-col text-xs text-slate-600 font-medium mt-2">
                                <div className="flex items-center mb-2">
                                  <FiUsers className="mr-2 text-slate-400 text-sm" />
                                  <span className="text-slate-500 mr-1.5">Members ({group.members?.length || 0}):</span>
                                </div>
                                <div className="max-h-32 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-lg p-2 bg-slate-50">
                                  {group.members?.map((member, idx) => (
                                    <div key={`${member._id}-${idx}`} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-1.5 shadow-sm">
                                      <div className="flex items-center space-x-2 overflow-hidden">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0 border border-indigo-100">
                                          {getUserInitials(member.name)}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                          <span className="text-slate-700 font-semibold truncate text-[11px]">{member.name}</span>
                                          <span className="text-slate-500 truncate text-[9px]">{member.email}</span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveMember(group._id, member._id, member.name)}
                                        className="text-rose-500 hover:text-white hover:bg-rose-500 p-1.5 rounded-lg transition-colors"
                                        title={`Remove ${member.name}`}
                                      >
                                        <FiTrash2 className="text-[10px]" />
                                      </button>
                                    </div>
                                  ))}
                                  {(!group.members || group.members.length === 0) && (
                                    <span className="text-slate-400 text-center block w-full py-2">No members</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => handleDeleteGroup(group._id, group.groupName)}
                            className="w-full bg-white hover:bg-rose-500 border border-rose-200 text-rose-600 hover:text-white hover:border-rose-500 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center space-x-1.5 mt-6 shadow-sm"
                          >
                            <FiTrash2 />
                            <span>Delete Group</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
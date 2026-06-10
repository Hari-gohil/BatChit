import { useEffect, useState } from "react";
import { createGroup } from "../services/createGroupService";
import { getUsers } from "../services/userService";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiCheck, FiSearch } from "react-icons/fi";

const CreateGroup = () => {
  const { token, user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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

  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    try {
      const payload = { groupName, description, members: selectedUsers };
      const promise = createGroup(payload, token);
      await toast.promise(promise, {
        loading: "Creating group...",
        success: "Group created successfully!",
        error: "Failed to create group",
      });
      navigate(`/`);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Group Details */}
        <div className="w-full md:w-1/3 bg-gray-50 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <FiUsers className="text-blue-600" /> New Group
          </h2>
          <form id="createGroupForm" onSubmit={handleSubmit} className="space-y-4 flex-1">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Group Name</label>
              <input
                type="text"
                placeholder="E.g. Development Team"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full border border-gray-200 bg-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea
                placeholder="What is this group about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 bg-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                rows="4"
              />
            </div>
          </form>
          <div className="mt-6">
            <button
              form="createGroupForm"
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2"
            >
               Create Group ({selectedUsers.length} members)
            </button>
          </div>
        </div>

        {/* Right Side: Select Members */}
        <div className="w-full md:w-2/3 p-6 flex flex-col h-[600px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Members</h3>
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search to add..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
            {filteredUsers.length === 0 ? (
               <div className="text-center text-gray-500 mt-10">No users found.</div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUsers.includes(u._id);
                return (
                  <div
                    key={u._id}
                    onClick={() => handleSelectUser(u._id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>{u.name}</h4>
                        <p className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>{u.email}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-transparent'}`}>
                       <FiCheck className="text-sm" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateGroup;
import useAuth from "../hooks/useAuth";
import { changePassword, updateProfile } from "../services/profileService";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { FiUser, FiPhone, FiInfo, FiLock, FiCamera, FiCheckCircle } from "react-icons/fi";

const Profile = () => {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  const [formData, setFormData] = useState({ name: "", bio: "", phone: "", profilePic: "" });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef(null);

  const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        phone: user.phone || "",
        profilePic: user.profilePic || "",
      });
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("bio", formData.bio);
      data.append("phone", formData.phone);
      if (profileImageFile) {
        data.append("profilePic", profileImageFile);
      } else {
        data.append("profilePic", formData.profilePic);
      }
      
      await updateProfile(data);
      toast.success("Profile Updated");
    } catch (error) {
      toast.error("Update Failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passwordData);
      toast.success("Password changed");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  if (!user) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 bg-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Pic Section */}
        <div className="flex flex-col items-center space-y-4 w-full md:w-1/3">
          <div className="relative group">
            <img 
              src={profileImagePreview || (formData.profilePic?.startsWith("/uploads") ? `${backendUrl}${formData.profilePic}` : formData.profilePic) || "https://via.placeholder.com/150"} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
            >
              <FiCamera className="text-white text-2xl" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">{user?.name || 'User'}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="w-full md:w-2/3">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-2">Profile Details</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2"><FiUser /> Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
            </div>
            
            {/* Removed Profile Image URL input */}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2"><FiPhone /> Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2"><FiInfo /> Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"></textarea>
            </div>

            <button type="submit" disabled={isUpdating} className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70">
              <FiCheckCircle /> {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2"><FiLock className="text-gray-500"/> Security & Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">Current Password</label>
            <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">New Password</label>
            <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

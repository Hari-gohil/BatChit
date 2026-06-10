import api from "../api/axios";

export const getDashboardStats = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data;
};

export const getAllUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

export const blockUser = async (id) => {
  const { data } = await api.put(`/admin/users/block/${id}`);
  return data;
};

export const unblockUser = async (id) => {
  const { data } = await api.put(`/admin/users/unblock/${id}`);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const getAllGroups = async () => {
  const { data } = await api.get("/admin/groups");
  return data;
};

export const deleteGroup = async (id) => {
  const { data } = await api.delete(`/admin/groups/${id}`);
  return data;
};

export const removeMemberFromGroup = async (groupId, userId) => {
  const { data } = await api.delete(`/admin/groups/${groupId}/members/${userId}`);
  return data;
};

export const getAllMessages = async () => {
  const { data } = await api.get("/admin/messages");
  return data;
};
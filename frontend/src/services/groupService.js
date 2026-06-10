import api from "../api/axios";

export const getGroups = async () => {
  const { data } = await api.get("/groups");
  return data;
};

export const deleteGroup = async (groupId) => {
  const res = await api.delete(
    `/groups/${groupId}`
  );

  return res.data;
};

export const leaveGroup = async (groupId) => {
  const res = await api.put(
    `/groups/${groupId}/leave`
  );

  return res.data;
};
import API from "../api/axios";

export const getMessages = async (chatId) => {
  const res = await API.get(
    `/messages/${chatId}`
  );

  return res.data;
};

export const getGroupMessages = async (groupId) => {
  const res = await API.get(
    `/messages/group/${groupId}`
  );

  return res.data;
};

export const sendMessage = async (
  data
) => {
  const res = await API.post(
    "/messages",
    data
  );

  return res.data;
};

export const deleteMessage = async (
  messageId
) => {
  const res = await API.delete(
    `/messages/${messageId}`
  );

  return res.data;
};

export const deleteAllMessages =
  async (chatId) => {
    const res = await API.delete(
      `/messages/chat/${chatId}`
    );

    return res.data;
  };
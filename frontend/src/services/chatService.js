import axios from "axios";
import API from "../api/axios";

export const getChats = async () => {
  const res = await API.get("/chats");
  return res.data;
};

export const createChat = async (receiverId) => {
  const res = await API.post("/chats", {
    receiverId,
  });

  return res.data;
};

export const deleteChat = async (
  chatId,
  token
) => {
  const res = await API.delete(
    `/chats/${chatId}/me`,
    {
      headers: {
        Authorization: ` Bearer ${token} `,
      },
    }
  );

  return res.data;
};

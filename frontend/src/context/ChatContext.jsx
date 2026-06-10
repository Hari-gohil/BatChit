import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import {
  getChats,
} from "../services/chatService";

import {
  getGroups,
} from "../services/groupService";

import useAuth from "../hooks/useAuth";

const ChatContext =
  createContext();

export const ChatProvider = ({
  children,
}) => {

    const { user, loading: authLoading } = useAuth();

  const [chats, setChats] =
    useState([]);

  const [groups, setGroups] =
    useState([]);

  const [selectedChat, setSelectedChat] =
    useState(null);

  const [selectedGroup, setSelectedGroup] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const fetchChats =
    async () => {
      try {
        setLoading(true);

        const data =
          await getChats();

        //   console.log("RAW CHAT RESPONSE:", data);
        //   console.log("CHAT CONTEXT:", chats);

        setChats(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

useEffect(() => {
  if (!authLoading && user) {
    fetchChats();
  }
}, [user, authLoading]);

useEffect(() => {
  const loadGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
      console.log(error);
    }
  };

  loadGroups();
}, []);

  return (
    <ChatContext.Provider
      value={{
        chats,
        groups,
        setChats,
        setGroups,
        selectedChat,
        selectedGroup,
        setSelectedChat,
        setSelectedGroup,
        fetchChats,
        loading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () =>
  useContext(ChatContext);
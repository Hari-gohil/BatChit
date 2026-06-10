import ChatList from "../components/ChatList";
import ChatBox from "../components/ChatBox";
import { useChat } from "../context/ChatContext";

const Home = () => {
  const { selectedChat, selectedGroup } = useChat();
  
  const isChatActive = selectedChat || selectedGroup;

  return (
    <div className="h-full grid grid-cols-12 overflow-hidden">

      <div className={`h-screen overflow-auto col-span-12 md:col-span-4 lg:col-span-3 ${isChatActive ? 'hidden md:block' : 'block'}`}>
        <ChatList />
      </div>

      <div className={`h-screen col-span-12 md:col-span-8 lg:col-span-9 ${!isChatActive ? 'hidden md:block' : 'block'}`}>
        <ChatBox />
      </div>

    </div>
  );
};

export default Home;
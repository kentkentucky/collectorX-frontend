import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { useAuth0 } from "@auth0/auth0-react";

import NavBar from "./components/NavBar";
import { AuthContext } from "./App";
import { realtimeDatabase } from "./db/firebase";

import "./Chat.css";

type Chat = {
  _id: string;
  participants: [
    {
      _id: string;
      username: string;
      image: string;
    }
  ];
  lastMessage: string;
};

type UnreadCountMap = {
  [chatID: string]: number;
};

function Chat() {
  const { user } = useAuth0();

  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  const [chats, setChats] = useState<Chat[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCountMap>({});
  console.log(unreadCounts);

  useEffect(() => {
    getChats();
  }, []);

  useEffect(() => {
    if (chats.length === 0) return;

    const fetchUnread = async () => {
      const counts: UnreadCountMap = {};

      for (const chat of chats) {
        const messagesRef = ref(realtimeDatabase, `chats/${chat._id}/messages`);
        const snapshot = await get(messagesRef);

        let count = 0;
        snapshot.forEach((msgSnap) => {
          const msg = msgSnap.val();
          if (msg.read === false && msg.receiverID === user?.sub?.slice(6)) {
            count++;
          }
        });

        counts[chat._id] = count;
      }

      setUnreadCounts(counts);
    };

    fetchUnread();
  }, [chats]);

  const getChats = async () => {
    try {
      const response = await axios.get("http://localhost:8080/chat", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setChats(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChat = (chatID: string) => {
    navigate(`${chatID}`);
  };

  return (
    <div className="chat-container">
      <h1 className="chat-header">All Chats</h1>
      <div className="chat-list">
        {chats.map((chat) => (
          <div
            className="chat-item"
            key={chat._id}
            onClick={() => {
              handleChat(chat._id);
            }}
          >
            <div className="user-avatar">
              {chat.participants[0].image ? (
                <img
                  src={chat.participants[0].image}
                  className="profile-user-image"
                  alt="user profile"
                />
              ) : (
                <div className="profile-user-placeholder">
                  {chat.participants[0].username?.charAt(0).toUpperCase() ||
                    "?"}
                </div>
              )}
            </div>
            <div className="chat-row">
              <div className="chat-content">
                <h3 className="participant-name">
                  {chat.participants[0]?.username}
                </h3>
                <p className="chat-preview">
                  {chat.lastMessage || "No messages yet"}
                </p>
              </div>
              {unreadCounts[chat._id] > 0 && (
                <div className="unread-badge">{unreadCounts[chat._id]}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <NavBar />
    </div>
  );
}

export default Chat;

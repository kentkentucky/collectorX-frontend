import { onChildAdded, push, ref, off, update } from "firebase/database";
import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { arrowBack, send } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { format, isSameDay } from "date-fns";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

import { realtimeDatabase } from "./db/firebase";
import { AuthContext } from "./App";

import "./ChatRoom.css";

type Message = {
  key: string;
  senderID: string;
  receiverID: string;
  message: string;
  timestamp: number;
  read: boolean;
};

type Participant = {
  _id?: string;
  username?: string;
  image?: string;
};

function ChatRoom() {
  const { user } = useAuth0();

  const authContext = useContext(AuthContext);

  const { chatID } = useParams<{ chatID: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Participant>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (!chatID) return;

    getParticipant();

    const chatRef = ref(realtimeDatabase, `chats/${chatID}/messages`);

    const handleChildAdded = (data: any) => {
      const messageData = data.val() as Omit<Message, "key">;
      setMessages((prevState) => {
        const exists = prevState.find((m) => m.key === data.key);
        if (exists) return prevState;

        const newMessages = [
          ...prevState,
          { key: data.key ?? "", ...messageData },
        ];
        // Sort by timestamp (ascending)
        return newMessages.sort((a, b) => a.timestamp - b.timestamp);
      });

      if (
        messageData.receiverID === user?.sub?.slice(6) &&
        messageData.read === false
      ) {
        const msgRef = ref(
          realtimeDatabase,
          `chats/${chatID}/messages/${data.key}`
        );
        update(msgRef, { read: true });
      }
    };

    onChildAdded(chatRef, handleChildAdded);

    return () => {
      off(chatRef);
    };
  }, [chatID, user?.sub]);

  const getParticipant = async () => {
    try {
      const response = await axios.get("http://localhost:8080/chat/room", {
        params: { chatID },
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = async () => {
    try {
      const lastMessage = messages[messages.length - 1];
      const response = await axios.put(
        "http://localhost:8080/chat",
        {
          chatID,
          lastMessage: lastMessage?.message || "",
          timestamp: lastMessage?.timestamp || null,
        },
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response.status == 200) {
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !chatID || !user?.sub) return;

    const message = {
      senderID: user.sub.slice(6),
      receiverID: profile._id,
      message: text,
      timestamp: Date.now(),
      read: false,
    };

    try {
      const messagesRef = ref(realtimeDatabase, `chats/${chatID}/messages`);
      await push(messagesRef, message);
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatDateLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, "MMMM d, yyyy"); // e.g., April 28, 2025
  };

  return (
    <div className="chat-room-container">
      <div className="chatroom-header">
        <IonIcon
          icon={arrowBack}
          className="chatroom-arrow-back-icon"
          onClick={handleBack}
        ></IonIcon>
        <p className="chat-username">{profile.username}</p>
        <div className="user-avatar">
          {profile.image ? (
            <img
              src={profile.image}
              className="chat-user-image"
              alt="user profile"
            />
          ) : (
            <div className="chat-user-placeholder">
              {profile.username?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => {
          const currentDate = new Date(message.timestamp);
          const previousDate =
            index > 0 ? new Date(messages[index - 1].timestamp) : null;

          const showDate =
            index === 0 ||
            (previousDate && !isSameDay(currentDate, previousDate));

          return (
            <div
              key={message.key}
              className={`message-wrapper ${
                message.senderID === user?.sub?.slice(6) ? "sender" : "receiver"
              }`}
            >
              {showDate && (
                <div className="date-label">
                  {formatDateLabel(message.timestamp)}
                </div>
              )}
              <div className="message-item">
                <div className="message-content">
                  <p className="message-text">{message.message}</p>
                  <small className="message-timestamp">
                    {format(new Date(message.timestamp), "HH:mm")}
                  </small>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input-container">
        <input
          className="text-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <IonIcon icon={send} className="send-icon" onClick={sendMessage} />
      </div>
    </div>
  );
}

export default ChatRoom;

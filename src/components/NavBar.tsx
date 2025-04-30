import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { IonIcon } from "@ionic/react";
import { home, compass, add, chatbubble, person } from "ionicons/icons";
import { useAuth0 } from "@auth0/auth0-react";
import { ref, get } from "firebase/database";
import axios from "axios";

import { realtimeDatabase } from "../db/firebase";
import { AuthContext } from "../App";

import "./NavBar.css";

function NavBar() {
  const { user } = useAuth0();

  const authContext = useContext(AuthContext);

  const location = useLocation();

  const [activeTab, setActiveTab] = useState("/home");
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    const fetchUnreadChats = async () => {
      if (!user?.sub) return;

      try {
        const response = await axios.get("http://localhost:8080/chat", {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        });

        const chats = response.data;
        let count = 0;

        for (const chat of chats) {
          const messagesRef = ref(
            realtimeDatabase,
            `chats/${chat._id}/messages`
          );
          const snapshot = await get(messagesRef);

          let hasUnread = false;
          snapshot.forEach((child) => {
            const msg = child.val();
            if (msg.receiverID === user?.sub?.slice(6) && msg.read === false) {
              hasUnread = true;
            }
          });

          if (hasUnread) count++;
        }

        setUnreadChats(count);
      } catch (error) {
        console.error("Error checking unread chats:", error);
      }
    };

    fetchUnreadChats();
  }, []);

  useEffect(() => {
    // Update active tab based on current route
    setActiveTab(location.pathname);
  }, [location]);

  const navItems = [
    { name: "Home", icon: home, path: "/home" },
    { name: "Explore", icon: compass, path: "/explore" },
    { name: "List", icon: add, path: "/list" },
    { name: "Chat", icon: chatbubble, path: "/chat", showBadge: true },
    { name: "Profile", icon: person, path: "/profile" },
  ];

  return (
    <div className="navbar-container">
      <div className="navbar">
        {navItems.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className={`navbar-item ${activeTab === item.path ? "active" : ""}`}
          >
            <div className="navbar-icon-wrapper">
              <IonIcon icon={item.icon} className="navbar-icon" />
              {item.showBadge && unreadChats > 0 && (
                <span className="unread-chat-badge">{unreadChats}</span>
              )}
            </div>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default NavBar;

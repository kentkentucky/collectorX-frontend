import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import { home, compass, add, chatbubble, person } from "ionicons/icons";

import "./NavBar.css";

function NavBar() {
  const [activeTab, setActiveTab] = useState("/home");
  const location = useLocation();

  useEffect(() => {
    // Update active tab based on current route
    setActiveTab(location.pathname);
  }, [location]);

  const navItems = [
    { name: "Home", icon: home, path: "/home" },
    { name: "Explore", icon: compass, path: "/explore" },
    { name: "List", icon: add, path: "/list" },
    { name: "Chat", icon: chatbubble, path: "/chat" },
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
            onClick={() => setActiveTab(item.path)}
          >
            <div className="navbar-icon-wrapper">
              <IonIcon icon={item.icon} className="navbar-icon" />
            </div>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default NavBar;

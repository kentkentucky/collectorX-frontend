import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { User, MessageCircle, Plus, Compass, Home } from "lucide-react";

import "./NavBar.css";

function NavBar() {
  const [activeTab, setActiveTab] = useState("home");
  const location = useLocation();

  useEffect(() => {
    // Update active tab based on current route
    const path = location.pathname.split("/")[1];
    setActiveTab(path || "home");
  }, [location]);

  const navItems = [
    { name: "Home", icon: <Home className="navbar-icon" />, path: "/home" },
    {
      name: "Explore",
      icon: <Compass className="navbar-icon" />,
      path: "/explore",
    },
    { name: "List", icon: <Plus className="navbar-icon" />, path: "/" },
    {
      name: "Chat",
      icon: <MessageCircle className="navbar-icon" />,
      path: "/chat",
    },
    {
      name: "Profile",
      icon: <User className="navbar-icon" />,
      path: "/profile",
    },
  ];

  return (
    <div className="navbar-container">
      <div className="navbar">
        {navItems.map((item) => (
          <Link
            to={item.path}
            key={item.name}
            className={`navbar-item ${activeTab === item.name ? "active" : ""}`}
            onClick={() => setActiveTab(item.name)}
          >
            <div className="navbar-icon-wrapper">{item.icon}</div>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default NavBar;

import "./App.css";
import "./Ionic.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import { setupIonicReact } from "@ionic/react";
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useState } from "react";
import { IonApp } from "@ionic/react";

setupIonicReact();
defineCustomElements(window);

import Login from "./Login";
import Registration from "./Registration";
import Home from "./Home";
import Explore from "./Explore";
import Profile from "./Profile";
import Chat from "./Chat";
import List from "./List";

interface AuthContextType {
  authToken: string;
  setAuthToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

function App() {
  const [authToken, setAuthToken] = useState("");

  return (
    <IonApp>
      <AuthContext.Provider value={{ authToken, setAuthToken }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/list" element={<List />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </IonApp>
  );
}

export default App;

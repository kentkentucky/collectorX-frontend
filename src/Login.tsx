import { App as CapApp } from "@capacitor/app";
import { useAuth0 } from "@auth0/auth0-react";
import { Browser } from "@capacitor/browser";
import { IonButton, IonIcon } from "@ionic/react";
import { logIn } from "ionicons/icons";
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./Login.css";

import { AuthContext } from "./App";

function Login() {
  const authContext = useContext(AuthContext);

  const {
    loginWithRedirect,
    handleRedirectCallback,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();

  const navigate = useNavigate();

  useEffect(() => {
    // Handle the 'appUrlOpen' event and call `handleRedirectCallback`
    CapApp.addListener("appUrlOpen", async ({ url }) => {
      if (
        url.includes("state") &&
        (url.includes("code") || url.includes("error"))
      ) {
        await handleRedirectCallback(url);
      }
      // No-op on Android
      await Browser.close();
    });
  }, [handleRedirectCallback]);

  useEffect(() => {
    if (isAuthenticated) {
      getAuthToken();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authContext?.authToken) {
      checkUser();
    }
  }, [authContext?.authToken]);

  const login = async () => {
    await loginWithRedirect({
      async openUrl(url) {
        // Redirect using Capacitor's Browser plugin
        await Browser.open({
          url,
          windowName: "_self",
        });
      },
    });
  };

  const getAuthToken = async () => {
    try {
      const authToken = await getAccessTokenSilently();
      if (authToken) {
        authContext?.setAuthToken(authToken);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkUser = async () => {
    const isNewUser = await validateNewUser();
    if (isNewUser) {
      navigate("/registration");
    } else {
      navigate("/home");
    }
  };

  const validateNewUser = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/validate", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      return response.data.isNewUser;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <div className="perspective">
        <div className="logo-container">
          <h1 className="logo">CollectorX</h1>
        </div>
      </div>
      {isAuthenticated ? null : (
        <IonButton className="login-btn" onClick={login}>
          <IonIcon icon={logIn} slot="start" />
          Login with Auth0
        </IonButton>
      )}
    </div>
  );
}

export default Login;

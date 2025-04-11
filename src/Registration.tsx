import { useState, createContext } from "react";

import UserForm from "./components/UserForm";
import PreferenceForm from "./components/PreferenceForm";

import "./Registration.css";

interface UserDetailsType {
  fullName: string;
  username: string;
  contact: string;
  birthday: string;
  gender: string;
  address: string;
  preferences: string[];
}

interface UserContextType {
  userDetails: UserDetailsType;
  setUserDetails: React.Dispatch<React.SetStateAction<UserDetailsType>>;
}

export const UserContext = createContext<UserContextType>({
  userDetails: {
    fullName: "",
    username: "",
    contact: "",
    birthday: "",
    gender: "",
    address: "",
    preferences: [],
  },
  setUserDetails: () => {},
});

interface RegistrationContextType {
  registrationStage: number;
  setRegistrationStage: React.Dispatch<React.SetStateAction<number>>;
}

export const RegistrationContext = createContext<RegistrationContextType>({
  registrationStage: 1,
  setRegistrationStage: () => {},
});

function Registration() {
  const [registrationStage, setRegistrationStage] = useState(1);
  const [userDetails, setUserDetails] = useState<UserDetailsType>({
    fullName: "",
    username: "",
    contact: "",
    birthday: "",
    gender: "",
    address: "",
    preferences: [],
  });

  const renderForm = () => {
    if (registrationStage == 1) return <UserForm />;
    if (registrationStage == 2) return <PreferenceForm />;
  };

  return (
    <div className="registration-container">
      <h1 className="registration-header">Registration</h1>
      <RegistrationContext.Provider
        value={{ registrationStage, setRegistrationStage }}
      >
        <UserContext.Provider value={{ userDetails, setUserDetails }}>
          {renderForm()}
        </UserContext.Provider>
      </RegistrationContext.Provider>
    </div>
  );
}

export default Registration;

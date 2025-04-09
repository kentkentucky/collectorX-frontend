import { useContext } from "react";
import {
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
} from "@ionic/react";

import "../Registration.css";

import { RegistrationContext } from "../Registration";
import { UserContext } from "../Registration";

function UserForm() {
  const registrationContext = useContext(RegistrationContext);
  const userContext = useContext(UserContext);

  const handleInputChange = (e: CustomEvent, key: string) => {
    const { value } = e.detail;
    userContext.setUserDetails((prevDetails) => ({
      ...prevDetails,
      [key]: value,
    }));
  };

  return (
    <div className="user-form-container">
      <form className="user-form">
        <h2 className="form-header">Complete Your Profile</h2>
        <IonItem>
          <IonInput
            label="Full Name"
            labelPlacement="floating"
            placeholder="Tan Wei Ming"
            className="ion-custom-input"
            value={userContext.userDetails.fullName}
            onIonChange={(e) => handleInputChange(e, "fullName")}
          ></IonInput>
        </IonItem>
        <IonItem>
          <IonInput
            label="Username"
            labelPlacement="floating"
            placeholder="tanweiming88"
            className="ion-custom-input"
            value={userContext.userDetails.username}
            onIonChange={(e) => handleInputChange(e, "username")}
          ></IonInput>
        </IonItem>
        <IonItem>
          <IonInput
            label="Contact"
            labelPlacement="floating"
            type="tel"
            placeholder="+65 1234 5678"
            className="ion-custom-input"
            value={userContext.userDetails.contact}
            onIonChange={(e) => handleInputChange(e, "contact")}
          ></IonInput>
        </IonItem>
        <IonItem>
          <IonInput
            label="Birthday"
            labelPlacement="floating"
            type="date"
            placeholder="YYYY-MM-DD"
            className="ion-custom-input"
            value={userContext.userDetails.birthday}
            onIonChange={(e) => handleInputChange(e, "birthday")}
          ></IonInput>
        </IonItem>
        <IonItem>
          <IonSelect
            label="Gender"
            labelPlacement="floating"
            value={userContext.userDetails.gender}
            onIonChange={(e) => handleInputChange(e, "gender")}
          >
            <IonSelectOption value="Male">Male</IonSelectOption>
            <IonSelectOption value="Female">Female</IonSelectOption>
            <IonSelectOption value="Others">Others</IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonInput
            label="Address"
            labelPlacement="floating"
            placeholder="123 Clementi Avenue 3, #05-67, Singapore 120123"
            className="ion-custom-input"
            value={userContext.userDetails.address}
            onIonChange={(e) => handleInputChange(e, "address")}
          ></IonInput>
        </IonItem>
      </form>
      <IonButton
        className="next-btn"
        onClick={() => registrationContext.setRegistrationStage(2)}
      >
        NEXT
      </IonButton>
    </div>
  );
}

export default UserForm;

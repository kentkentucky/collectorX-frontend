import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../App";
import { UserContext, RegistrationContext } from "../Registration";
import { IonButton } from "@ionic/react";

import "../Registration.css";

type category = {
  _id: string;
  name: string;
  description: string;
};

function PreferenceForm() {
  const authContext = useContext(AuthContext);
  const userContext = useContext(UserContext);
  const registrationContext = useContext(RegistrationContext);

  const navigate = useNavigate();

  const [categories, setCategories] = useState<category[]>([]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8080/category", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = (
    e: React.MouseEvent<HTMLIonButtonElement>,
    categoryID: string
  ) => {
    e.preventDefault();
    userContext.setUserDetails((prevCategory) => {
      const preferences = prevCategory.preferences.includes(categoryID)
        ? prevCategory.preferences.filter((pref) => pref !== categoryID)
        : [...prevCategory.preferences, categoryID];
      return { ...prevCategory, preferences };
    });
  };

  const handleBack = (e: React.MouseEvent<HTMLIonButtonElement>) => {
    e.preventDefault();
    registrationContext.setRegistrationStage(
      registrationContext.registrationStage - 1
    );
  };

  const handleFinish = async (e: React.MouseEvent<HTMLIonButtonElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/user/register",
        { userDetails: userContext.userDetails },
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response) {
        navigate("/home");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="preference-form-container">
      <h2 className="form-header">Help Us Personalise Your Experience</h2>
      <div className="categories-container">
        {categories.map((category, index) => (
          <IonButton
            key={index}
            className={`category-btn${
              userContext.userDetails.preferences.includes(category._id)
                ? "selected"
                : ""
            }`}
            onClick={(e) => {
              handleSelect(e, category._id);
            }}
          >
            {category.name}
          </IonButton>
        ))}
      </div>
      <div className="btn-container">
        <IonButton className="back-btn" onClick={handleBack}>
          BACK
        </IonButton>
        <IonButton className="finish-btn" onClick={handleFinish}>
          FINISH
        </IonButton>
      </div>
    </div>
  );
}

export default PreferenceForm;

import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonTextarea,
} from "@ionic/react";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { ListingContext, StageContext } from "../List";

import "../List.css";

const libraries: "places"[] = ["places"];

type Condition = {
  _id: string;
  name: string;
  description: string;
};

function ListingDetailsForm() {
  const authContext = useContext(AuthContext);
  const listingContext = useContext(ListingContext);
  const stageContext = useContext(StageContext);

  const navigate = useNavigate();

  const [conditions, setConditions] = useState<Condition[]>([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    getConditions();
  }, []);

  const getConditions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/listing/condition",
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response) {
        setConditions(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e: CustomEvent, key: string) => {
    const { value } = e.detail;
    listingContext.setListingDetails((prevDetails) => ({
      ...prevDetails,
      [key]: value,
    }));
  };

  const handleLocation = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        listingContext.setListingDetails((prevDetails) => ({
          ...prevDetails,
          location: place.formatted_address || "",
        }));
      }
    }
  };

  const handleBack = (e: React.MouseEvent<HTMLIonButtonElement>) => {
    e.preventDefault();
    stageContext.setListingStage(stageContext.listingStage - 1);
  };

  const handleFinish = async (e: React.MouseEvent<HTMLIonButtonElement>) => {
    e.preventDefault();
    const formData = new FormData();

    // Append other listing details
    formData.append("name", listingContext.listingDetails.name);
    formData.append("description", listingContext.listingDetails.description);
    formData.append("category", listingContext.listingDetails.category);
    formData.append("condition", listingContext.listingDetails.condition);
    formData.append("size", listingContext.listingDetails.size);
    formData.append(
      "price",
      listingContext.listingDetails.price?.toString() || ""
    );
    formData.append("dealMethod", listingContext.listingDetails.dealMethod);
    formData.append("location", listingContext.listingDetails.location);

    // Convert image URLs to Blobs and append them to FormData
    for (let i = 0; i < listingContext.listingDetails.images.length; i++) {
      const response = await fetch(listingContext.listingDetails.images[i]); // Fetch the file from the URL
      const blob = await response.blob(); // Convert to Blob
      const fileName = `image-${i + 1}-${Date.now()}.jpg`;
      formData.append("images", blob, fileName); // Append to FormData
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/list/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response) {
        navigate("/profile");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loadError) return <div>Error loading Google Maps script</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <div className="listing-form-container">
      <form className="listing-details-form">
        <IonItem className="ion-custom-item">
          <IonInput
            label="Listing Name"
            labelPlacement="floating"
            placeholder="Name your listing"
            className="ion-custom-input"
            value={listingContext.listingDetails.name}
            onIonChange={(e) => handleInputChange(e, "name")}
          ></IonInput>
        </IonItem>
        <IonItem className="ion-custom-item">
          <IonTextarea
            label="Listing Description"
            labelPlacement="floating"
            placeholder="Share details helpful to buyers"
            className="ion-custom-input"
            value={listingContext.listingDetails.description}
            onIonChange={(e) => handleInputChange(e, "description")}
          ></IonTextarea>
        </IonItem>
        <IonItem className="ion-custom-item">
          <IonSelect
            label="Condition"
            labelPlacement="floating"
            interface="action-sheet"
            value={listingContext.listingDetails.condition}
            onIonChange={(e) => handleInputChange(e, "condition")}
          >
            {conditions.map((condition) => (
              <IonSelectOption value={condition._id} key={condition._id}>
                {condition.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        <IonItem className="ion-custom-item">
          <IonInput
            label="Size"
            labelPlacement="floating"
            placeholder="Size"
            className="ion-custom-input"
            value={listingContext.listingDetails.size}
            onIonChange={(e) => handleInputChange(e, "size")}
          ></IonInput>
        </IonItem>
        <IonItem className="ion-custom-item">
          <IonInput
            label="Listing Price"
            labelPlacement="floating"
            type="number"
            placeholder="Price of your listing"
            className="ion-custom-input"
            value={listingContext.listingDetails.price}
            onIonChange={(e) => handleInputChange(e, "price")}
          ></IonInput>
        </IonItem>
        <IonItem className="ion-custom-item">
          <IonSelect
            label="Fulfillment Method"
            labelPlacement="floating"
            interface="action-sheet"
            value={listingContext.listingDetails.dealMethod}
            onIonChange={(e) => handleInputChange(e, "dealMethod")}
          >
            <IonSelectOption value="Delivery">Delivery</IonSelectOption>
            <IonSelectOption value="Meetup">Meet-Up</IonSelectOption>
            <IonSelectOption value="Either">Either</IonSelectOption>
          </IonSelect>
        </IonItem>
        {(listingContext.listingDetails.dealMethod === "meetup" ||
          listingContext.listingDetails.dealMethod === "either") && (
          <div>
            <IonItem className="ion-custom-item">
              <Autocomplete
                onLoad={(auto) => {
                  autocompleteRef.current = auto;
                }}
                onPlaceChanged={handleLocation}
              >
                <input
                  type="text"
                  placeholder="Location"
                  className="autocomplete-input"
                  value={listingContext.listingDetails.location}
                  onChange={(e) =>
                    listingContext.setListingDetails((prevDetails) => ({
                      ...prevDetails,
                      location: e.target.value,
                    }))
                  }
                />
              </Autocomplete>
            </IonItem>
          </div>
        )}
      </form>
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

export default ListingDetailsForm;

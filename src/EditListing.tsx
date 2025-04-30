import { useParams, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { addCircle, close, removeCircle } from "ionicons/icons";
import {
  IonIcon,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
} from "@ionic/react";
import { Camera } from "@capacitor/camera";
import { Autocomplete, useLoadScript } from "@react-google-maps/api";

import { AuthContext } from "./App";

import "./EditListing.css";

const libraries: "places"[] = ["places"];

type Listing = {
  _id?: string;
  name?: string;
  description?: string;
  dealMethod?: string;
  location?: string;
  price?: number;
  size?: string;
  condition?: {
    _id: string;
    name: string;
  };
  images?: string[];
  createdAt?: Date;
  likes?: number;
  userID?: {
    _id: string;
    username: string;
    image: string;
    reviews: {
      rating: number;
    }[];
    createdAt: string;
  };
};

type Condition = {
  _id: string;
  name: string;
  description: string;
};

function EditListing() {
  const authContext = useContext(AuthContext);

  const { listingID } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing>({});
  const [conditions, setConditions] = useState<Condition[]>([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    getListing();
    getConditions();
  }, []);

  const getListing = async () => {
    try {
      const response = await axios.get("http://localhost:8080/listing", {
        params: { listingID },
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setListing(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  const addImages = async () => {
    try {
      const result = await Camera.pickImages({
        quality: 100,
      });
      // Extract webPaths from the result and update state
      const imageUrls = result.photos.map((photo) => photo.webPath!);
      setListing({
        ...listing,
        images: [...(listing.images ?? []), ...imageUrls], // Append new images
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const removeImage = (index: number) => {
    const updatedImages = listing.images?.filter((_, i) => i !== index);
    setListing({
      ...listing,
      images: updatedImages,
    });
  };

  const handleInputChange = (e: CustomEvent, key: string) => {
    const { value } = e.detail;
    setListing((prevDetails) => ({
      ...prevDetails,
      [key]: value,
    }));
  };

  const handleLocation = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        setListing((prevDetails) => ({
          ...prevDetails,
          location: place.formatted_address || "",
        }));
      }
    }
  };

  const handleSave = async (e: React.MouseEvent<HTMLIonButtonElement>) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("id", listingID || "");
    formData.append("name", listing.name || "");
    formData.append("description", listing.description || "");
    formData.append("condition", listing.condition?._id || "");
    formData.append("size", listing.size || "");
    formData.append("price", listing.price?.toString() || "");
    formData.append("dealMethod", listing.dealMethod || "");
    formData.append("location", listing.location || "");

    const existingImages: string[] = [];
    const newImages: string[] = [];

    // Separate existing and new images
    if (listing.images) {
      for (const imageUrl of listing.images) {
        if (imageUrl.startsWith("https://storage.googleapis.com")) {
          // Existing image (Firebase URL)
          existingImages.push(imageUrl);
        } else {
          // New image (local file)
          const response = await fetch(imageUrl); // Fetch the file from the URL
          const blob = await response.blob(); // Convert to Blob

          // Generate a custom file name
          const fileName = `image-${Date.now()}.jpg`;
          formData.append("newImages", blob, fileName); // Append Blob with custom file name
          newImages.push(fileName); // Add the file name to the newImages array
        }
      }
    }

    // Append existingImages and newImages as JSON strings
    formData.append("existingImages", JSON.stringify(existingImages));
    formData.append("newImages", JSON.stringify(newImages));

    try {
      const response = await axios.put(
        "http://localhost:8080/listing/edit",
        formData,
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        navigate(-1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loadError) return <div>Error loading Google Maps script</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <div className="edit-listing-container">
      <IonIcon icon={close} className="close-icon" onClick={handleBack} />
      <div className="image-preview-container">
        {listing.images?.map((image, index) => (
          <div className="listing-image-wrapper">
            <img key={index} src={image} className="captured-image" />
            <IonIcon
              icon={removeCircle}
              className="remove-circle-icon"
              onClick={() => {
                removeImage(index);
              }}
            />
          </div>
        ))}
        <IonIcon
          icon={addCircle}
          className="add-circle-icon"
          onClick={addImages}
        />
      </div>
      <form className="listing-details-form">
        <IonItem className="ion-custom-item">
          <IonInput
            label="Listing Name"
            labelPlacement="floating"
            placeholder="Name your listing"
            className="ion-custom-input"
            value={listing.name}
            onIonChange={(e) => handleInputChange(e, "name")}
          ></IonInput>
        </IonItem>
        <IonItem className="ion-custom-item">
          <IonTextarea
            label="Listing Description"
            labelPlacement="floating"
            placeholder="Share details helpful to buyers"
            className="ion-custom-input"
            value={listing.description}
            onIonChange={(e) => handleInputChange(e, "description")}
          ></IonTextarea>
        </IonItem>
        <IonItem className="ion-custom-item">
          <IonSelect
            label="Condition"
            labelPlacement="floating"
            interface="action-sheet"
            value={listing.condition?._id}
            onIonChange={(e) => handleInputChange(e, "condition")}
          >
            {conditions.map((condition) => (
              <IonSelectOption value={condition._id} key={condition._id}>
                {condition.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        {listing.size && (
          <IonItem className="ion-custom-item">
            <IonInput
              label="Size"
              labelPlacement="floating"
              placeholder="Size"
              className="ion-custom-input"
              value={listing.size}
              onIonChange={(e) => handleInputChange(e, "size")}
            ></IonInput>
          </IonItem>
        )}
        <IonItem className="ion-custom-item">
          <IonInput
            label="Listing Price"
            labelPlacement="floating"
            type="number"
            placeholder="Price of your listing"
            className="ion-custom-input"
            value={listing.price}
            onIonChange={(e) => handleInputChange(e, "price")}
          ></IonInput>
        </IonItem>
        <IonItem className="ion-custom-item">
          <IonSelect
            label="Fulfillment Method"
            labelPlacement="floating"
            interface="action-sheet"
            value={listing.dealMethod}
            onIonChange={(e) => handleInputChange(e, "dealMethod")}
          >
            <IonSelectOption value="delivery">Delivery</IonSelectOption>
            <IonSelectOption value="meetup">Meet-Up</IonSelectOption>
            <IonSelectOption value="either">Either</IonSelectOption>
          </IonSelect>
        </IonItem>
        {(listing.dealMethod === "meetup" ||
          listing.dealMethod === "either") && (
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
                  value={listing.location}
                  onChange={(e) =>
                    setListing((prevDetails) => ({
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
      <IonButton className="listing-save-btn" onClick={handleSave}>
        SAVE
      </IonButton>
    </div>
  );
}

export default EditListing;

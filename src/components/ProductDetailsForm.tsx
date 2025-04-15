import { Camera } from "@capacitor/camera";
import { useEffect, useState, useContext } from "react";
import { addCircle } from "ionicons/icons";
import { IonIcon, IonSearchbar } from "@ionic/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../App";
import { ListingContext, StageContext } from "../List";

import "../List.css";

type category = {
  _id: string;
  name: string;
};

function ProductDetailsForm() {
  const authContext = useContext(AuthContext);
  const listingContext = useContext(ListingContext);
  const stageContext = useContext(StageContext);

  const navigate = useNavigate();

  const [categories, setCategories] = useState<category[]>([]);
  let [results, setResults] = useState<category[]>([]);

  useEffect(() => {
    pickImages();
    getCategories();
  }, []);

  const pickImages = async () => {
    try {
      const result = await Camera.pickImages({
        quality: 100,
      });
      // Extract webPaths from the result and update state
      const imageUrls = result.photos.map((photo) => photo.webPath!);
      listingContext.setListingDetails({
        ...listingContext.listingDetails,
        images: imageUrls,
      });
    } catch (error: any) {
      if (error.message === "User cancelled photos app") {
        navigate(-1);
      } else {
        console.error(error);
      }
    }
  };

  const getCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8080/category", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setCategories(response.data);
        setResults(response.data);
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
      listingContext.setListingDetails({
        ...listingContext.listingDetails,
        images: [...listingContext.listingDetails.images, ...imageUrls], // Append new images
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleInput = (e: CustomEvent) => {
    let query = e.detail.value.toLowerCase();
    setResults(
      categories.filter((c) => c.name.toLowerCase().indexOf(query) > -1)
    );
  };

  const handleCategory = (categoryID: string) => {
    listingContext.setListingDetails({
      ...listingContext.listingDetails,
      category: categoryID,
    });
    stageContext.setListingStage(stageContext.listingStage + 1);
  };

  return (
    <div className="product-details-form">
      <div className="image-preview-container">
        {listingContext.listingDetails.images.map((image, index) => (
          <img key={index} src={image} className="captured-image" />
        ))}
        <IonIcon
          icon={addCircle}
          className="add-circle-icon"
          onClick={addImages}
        />
      </div>
      <div className="choose-category-container">
        <h2 className="choose-category-header">Choose Category</h2>
        <IonSearchbar
          className="category-searchbar"
          debounce={500}
          onIonInput={(e) => handleInput(e)}
        />
        <div className="category-options">
          {results.map((result) => (
            <div
              className="category-option"
              key={result._id}
              onClick={() => {
                handleCategory(result._id);
              }}
            >
              <p>{result.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsForm;

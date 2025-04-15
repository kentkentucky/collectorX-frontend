import { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { IonIcon } from "@ionic/react";
import { arrowBack, heart } from "ionicons/icons";
import { formatDistanceToNow } from "date-fns";

import { AuthContext } from "./App";

import "./Category.css";

type Category = {
  name?: string;
  listings?: {
    _id: string;
    name: string;
    description: string;
    price: number;
    location: string;
    dealMethod: string;
    images: string[];
    condition: {
      _id: string;
      name: string;
    };
    createdAt: Date;
  }[];
};

function Category() {
  const authContext = useContext(AuthContext);

  const { categoryID } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category>({});

  useEffect(() => {
    getCategoryListings();
  }, []);

  const getCategoryListings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/category/listings",
        {
          params: { categoryID },
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response) {
        setCategory(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleListing = (listingID: string) => {
    navigate(`/listing/${listingID}`);
  };

  return (
    <div className="category-container">
      <div className="category-header">
        <IonIcon
          icon={arrowBack}
          className="arrow-back-icon"
          onClick={handleBack}
        />
        <h1 className="category-page-title">{category?.name}</h1>
      </div>
      <div className="category-listings">
        {category.listings?.map((listing) => (
          <div
            className="category-listing-card"
            key={listing._id}
            onClick={() => {
              handleListing(listing._id);
            }}
          >
            <div className="card-image-wrapper">
              <img src={listing.images?.[0]} className="card-image" />
              <div className="listing-duration-overlay">
                {listing.createdAt
                  ? formatDistanceToNow(listing.createdAt, {
                      addSuffix: true,
                    })
                  : "Unknown"}
              </div>
            </div>
            <div className="card-details">
              <div className="card-meta">
                <p className="category-listing-name">{listing.name}</p>
                <p className="category-listing-price">S${listing.price}</p>
                <p className="category-listing-condition">
                  {listing.condition.name}
                </p>
              </div>
              <div className="likes-container">
                <IonIcon icon={heart} className="category-heart-icon" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Category;

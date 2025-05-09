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

type Favourite = {
  _id: string;
  listingID: string;
};

function Category() {
  const authContext = useContext(AuthContext);

  const { categoryID } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category>({});
  const [favourites, setFavourites] = useState<string[]>([]);

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
        setFavourites(
          response.data.favourites.map(
            (favourite: Favourite) => favourite.listingID
          )
        );
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

  const handleFavourite = async (
    e: React.MouseEvent<HTMLIonIconElement>,
    listingID: string
  ) => {
    e.stopPropagation();
    try {
      const response = await axios.post(
        "http://localhost:8080/favourites",
        { listingID },
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response.status == 200) {
        // Update the favourites state
        setFavourites((prevFavourites) => {
          if (prevFavourites.includes(listingID)) {
            // Remove from favourites
            return prevFavourites.filter((id) => id !== listingID);
          } else {
            // Add to favourites
            return [...prevFavourites, listingID];
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
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
                <IonIcon
                  icon={heart}
                  className={`home-heart-icon ${
                    favourites.includes(listing._id) ? "active" : ""
                  }`}
                  onClick={(e) => {
                    handleFavourite(e, listing._id);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Category;

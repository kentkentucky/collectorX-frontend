import { IonIcon } from "@ionic/react";
import { arrowBack, heart } from "ionicons/icons";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";

import { AuthContext } from "./App";

import "./Favourites.css";

type Favourites = {
  _id: string;
  listingID: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    condition: {
      _id: string;
      name: string;
    };
    createdAt: Date;
    likes: number;
  };
};

function Favourites() {
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  const [favourites, setFavourites] = useState<Favourites[]>([]);
  console.log(favourites);

  useEffect(() => {
    getFavourites();
  }, []);

  const getFavourites = async () => {
    try {
      const response = await axios.get("http://localhost:8080/favourites", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setFavourites(response.data);
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
          if (
            prevFavourites.some(
              (favourite) => favourite.listingID._id === listingID
            )
          ) {
            // Remove from favourites
            return prevFavourites.filter(
              (favourite) => favourite.listingID._id !== listingID
            );
          } else {
            // Add to favourites
            return [
              ...prevFavourites,
              { _id: response.data._id, listingID: response.data.listingID },
            ];
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="favourites-container">
      <div className="favourite-header">
        <IonIcon
          icon={arrowBack}
          className="arrow-back-icon"
          onClick={handleBack}
        />
        <h1 className="favourite-title">Favourites</h1>
      </div>
      <div className="favourites-listings">
        {favourites.map((favourite) => (
          <div
            className="favourite-listing-card"
            key={favourite._id}
            onClick={() => {
              handleListing(favourite.listingID._id);
            }}
          >
            <div className="card-image-wrapper">
              <img
                src={favourite.listingID.images?.[0]}
                className="card-image"
              />
              <div className="listing-duration-overlay">
                {favourite.listingID.createdAt
                  ? formatDistanceToNow(favourite.listingID.createdAt, {
                      addSuffix: true,
                    })
                  : "Unknown"}
              </div>
            </div>
            <div className="card-details">
              <div className="card-meta">
                <p className="category-listing-name">
                  {favourite.listingID.name}
                </p>
                <p className="favourite-listing-price">
                  S${favourite.listingID.price}
                </p>
                <p className="favourite-listing-condition">
                  {favourite.listingID.condition?.name}
                </p>
              </div>
              <div className="likes-container">
                <IonIcon
                  icon={heart}
                  className="favourite-heart-icon active"
                  onClick={(e) => {
                    handleFavourite(e, favourite.listingID._id);
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

export default Favourites;

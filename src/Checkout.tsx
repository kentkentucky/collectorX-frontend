import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

import { AuthContext } from "./App";
import StripePaymentButton from "./components/StripePaymentButton";

import "./Checkout.css";

type Listing = {
  _id?: string;
  name?: string;
  description?: string;
  dealMethod?: string;
  location?: string;
  price?: number;
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

function Checkout() {
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();
  const { listingID, offerID } = useParams();
  const location = useLocation();
  const offer = location.state?.offer;

  const [listing, setListing] = useState<Listing>({});

  useEffect(() => {
    getListing();
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

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <IonIcon
          icon={arrowBack}
          className="checkout-arrow-back-icon"
          onClick={handleBack}
        />
        <h1 className="checkout-title">Make Payment</h1>
      </div>
      <div className="checkout-details-container">
        <div className="checkout-review">
          <h2 className="checkout-detail-header">Review your booking</h2>
          <div className="checkout-item">
            <div className="checkout-item-image-wrapper">
              <img src={listing.images?.[0]} className="item-listing-image" />
            </div>
            <div className="item-listing-details">
              <p className="item-listing-name">{listing.name}</p>
              <p className="item-listing-condition">
                Condition: {listing.condition?.name}
              </p>
              <p className="item-listing-deal-method">
                {" "}
                Method: {listing.dealMethod}
              </p>
              {listing.location && <p>Location: {listing.location}</p>}
            </div>
            <div className="item-listing-total">
              {offer ? (
                <div className="item-offer-price">
                  <p className="original-price">S${listing.price}</p>
                  <p className="offer-price">S${offer}</p>
                </div>
              ) : (
                <p className="offer-price">S${listing.price}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="checkout-summary">
        <div className="total-section">
          <h3 className="total-label">Total</h3>
          <p className="total-value">S${offer ? offer : listing.price}</p>
        </div>
        {authContext?.authToken && listing._id && listing.userID?._id && (
          <StripePaymentButton
            amount={offer ? offer : listing.price}
            authToken={authContext.authToken}
            listingID={listing._id}
            sellerID={listing.userID._id}
            offerID={offerID}
          />
        )}
      </div>
    </div>
  );
}

export default Checkout;

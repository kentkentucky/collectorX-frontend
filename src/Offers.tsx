import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { IonIcon, IonButton, IonToast } from "@ionic/react";
import { arrowBack, close, checkmark, trash, cart } from "ionicons/icons";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { AuthContext } from "./App";

import "./Offers.css";

type Offer = {
  _id: string;
  offer: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  listingID: {
    _id: string;
    images: string[];
    name: string;
    price: number;
  };
};

function Offers() {
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  const [outgoing, setOutgoing] = useState<Offer[]>([]);
  const [incoming, setIncoming] = useState<Offer[]>([]);
  const [accepted, setAccepted] = useState<Offer[]>([]);
  const [declined, setDeclined] = useState<Offer[]>([]);
  const [cancelled, setCancelled] = useState<Offer[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getOffers();
  }, []);

  const getOffers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/offer", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setOutgoing(response.data.outgoing);
        setIncoming(response.data.incoming);
        setAccepted(response.data.accepted);
        setDeclined(response.data.declined);
        setCancelled(response.data.cancelled);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const updateOffer = async (offerID: string, status: string) => {
    try {
      const response = await axios.put(
        "http://localhost:8080/offer/response",
        { offerID, status },
        {
          headers: {
            Authorization: `Bearer ${authContext?.authToken}`,
          },
        }
      );
      if (response.status == 200) {
        setMessage(response.data);
        setShowToast(true);
        getOffers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="offer-container">
      <div className="offer-header">
        <IonIcon
          icon={arrowBack}
          className="arrow-back-icon"
          onClick={handleBack}
        />
        <h1 className="offer-page-title">Offers</h1>
      </div>
      {incoming.length > 0 && (
        <div className="incoming-offers">
          <h2 className="incoming-header">Incoming</h2>
          {incoming.map((offer) => (
            <div className="offer" key={offer._id}>
              <div className="offer-listing-image-wrapper">
                <img
                  src={offer.listingID.images[0]}
                  className="offer-listing-image"
                />
              </div>
              <div className="offer-listing-details">
                <p className="offer-listing-name">{offer.listingID.name}</p>
                <p className="offer-listing-price">
                  Price: {offer.listingID.price}
                </p>
                <p className="offer-listing-status">Status: {offer.status}</p>
                <p className="offer-price">Offer: {offer.offer}</p>
                <p className="offer-date">
                  Date: {format(offer.createdAt, "dd MMM yyyy")}
                </p>
              </div>
              <div className="offer-actions">
                <IonButton
                  className="decline-btn"
                  onClick={() => {
                    updateOffer(offer._id, "Declined");
                  }}
                >
                  <IonIcon icon={close} className="decline-icon" />
                </IonButton>
                <IonButton
                  className="accept-btn"
                  onClick={() => {
                    updateOffer(offer._id, "Accepted");
                  }}
                >
                  <IonIcon icon={checkmark} className="accept-icon" />
                </IonButton>
              </div>
            </div>
          ))}
        </div>
      )}
      {outgoing.length > 0 && (
        <div className="outgoing-offers">
          <h2 className="outgoing-header">Outgoing</h2>
          {outgoing.map((offer) => (
            <div className="offer" key={offer._id}>
              <div className="offer-listing-image-wrapper">
                <img
                  src={offer.listingID.images[0]}
                  className="offer-listing-image"
                />
              </div>
              <div className="offer-listing-details">
                <p className="offer-listing-name">{offer.listingID.name}</p>
                <p className="offer-listing-price">
                  Price: {offer.listingID.price}
                </p>
                <p className="offer-listing-status">Status: {offer.status}</p>
                <p className="offer-price">Offer: {offer.offer}</p>
                <p className="offer-date">
                  Date: {format(offer.updatedAt, "dd MMM yyyy")}
                </p>
              </div>
              <IonButton
                className="delete-btn"
                onClick={() => {
                  updateOffer(offer._id, "Cancelled");
                }}
              >
                <IonIcon icon={trash} className="trash-icon" />
              </IonButton>
            </div>
          ))}
        </div>
      )}
      {accepted.length > 0 && (
        <div className="accepted-offers">
          <h2 className="accepted-header">Accepted</h2>
          {accepted.map((offer) => (
            <div className="offer" key={offer._id}>
              <div className="offer-listing-image-wrapper">
                <img
                  src={offer.listingID.images[0]}
                  className="offer-listing-image"
                />
              </div>
              <div className="offer-listing-details">
                <p className="offer-listing-name">{offer.listingID.name}</p>
                <p className="offer-listing-status">Status: {offer.status}</p>
                <p className="offer-price">Price: {offer.offer}</p>
                <p className="offer-date">
                  Date: {format(offer.createdAt, "dd MMM yyyy")}
                </p>
              </div>
              <IonButton
                className="checkout-btn"
                onClick={() => {
                  navigate(
                    `/listing/${offer.listingID._id}/${offer._id}/checkout`,
                    {
                      state: { offer: offer.offer },
                    }
                  );
                }}
              >
                <IonIcon icon={cart} className="cart-icon" />
              </IonButton>
            </div>
          ))}
        </div>
      )}
      {declined.length > 0 && (
        <div className="declined-offers">
          <h2 className="declined-header">Declined</h2>
          {declined.map((offer) => (
            <div className="offer" key={offer._id}>
              <div className="offer-listing-image-wrapper">
                <img
                  src={offer.listingID.images[0]}
                  className="offer-listing-image"
                />
              </div>
              <div className="offer-listing-details">
                <p className="offer-listing-name">{offer.listingID.name}</p>
                <p className="offer-listing-price">
                  Price: {offer.listingID.price}
                </p>
                <p className="offer-listing-status">Status: {offer.status}</p>
                <p className="offer-price">Offer: {offer.offer}</p>
                <p className="offer-date">
                  Date: {format(offer.updatedAt, "dd MMM yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {cancelled.length > 0 && (
        <div className="cancelled-offers">
          <h2 className="cancelled-header">Cancelled</h2>
          {cancelled.map((offer) => (
            <div className="offer" key={offer._id}>
              <div className="offer-listing-image-wrapper">
                <img
                  src={offer.listingID.images[0]}
                  className="offer-listing-image"
                />
              </div>
              <div className="offer-listing-details">
                <p className="offer-listing-name">{offer.listingID.name}</p>
                <p className="offer-listing-price">
                  Price: {offer.listingID.price}
                </p>
                <p className="offer-listing-status">Status: {offer.status}</p>
                <p className="offer-price">Offer: {offer.offer}</p>
                <p className="offer-date">
                  Date: {format(offer.updatedAt, "dd MMM yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={message}
        duration={2000}
      />
    </div>
  );
}

export default Offers;

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IonIcon, IonButton } from "@ionic/react";
import { arrowBack, document } from "ionicons/icons";
import axios from "axios";
import { format } from "date-fns";

import { AuthContext } from "./App";

import "./Purchases.css";

type Item = {
  _id: string;
  amount: number;
  listingID: {
    _id: string;
    name: string;
    images: string[];
  };
  review: string;
  createdAt: Date;
};

function Purchases() {
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  const [purchases, setPurchases] = useState<Item[]>([]);
  console.log(purchases);

  useEffect(() => {
    getPurchases();
  }, []);

  const getPurchases = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/purchases", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setPurchases(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="purchases-container">
      <div className="purchases-header">
        <IonIcon
          icon={arrowBack}
          className="arrow-back-icon"
          onClick={handleBack}
        />
        <h1 className="purchases-title">Purchases</h1>
      </div>
      {purchases.length > 0 ? (
        <div className="purchases-list">
          {purchases.map((purchase) => (
            <div className="purchase-item" key={purchase._id}>
              <div className="purchase-listing-image-wrapper">
                <img
                  src={purchase.listingID.images[0]}
                  className="purchase-listing-image"
                />
              </div>
              <div className="purchase-listing-details">
                <p className="purchase-listing-name">
                  {purchase.listingID.name}
                </p>
                <p className="purchase-price">Amount: S${purchase.amount}</p>
                <p className="purchase-date">
                  Date: {format(purchase.createdAt, "dd MMM yyyy")}
                </p>
              </div>
              {!purchase.review && (
                <IonButton className="review-btn">
                  <IonIcon icon={document} />
                </IonButton>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No purchases yet.</p>
      )}
    </div>
  );
}

export default Purchases;

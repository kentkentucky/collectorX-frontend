import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IonIcon, IonButton } from "@ionic/react";
import { arrowBack, document } from "ionicons/icons";
import axios from "axios";
import { format } from "date-fns";

import { AuthContext } from "./App";

import "./Sales.css";

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

function Sales() {
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  const [sales, setSales] = useState<Item[]>([]);

  useEffect(() => {
    getSales();
  }, []);

  const getSales = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/sales", {
        headers: {
          Authorization: `Bearer ${authContext?.authToken}`,
        },
      });
      if (response) {
        setSales(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="sales-container">
      <div className="sales-header">
        <IonIcon
          icon={arrowBack}
          className="arrow-back-icon"
          onClick={handleBack}
        />
        <h1 className="sales-title">Sales</h1>
      </div>
      {sales.length > 0 ? (
        <div className="sales-list">
          {sales.map((sale) => (
            <div className="sale-item" key={sale._id}>
              <div className="sale-listing-image-wrapper">
                <img
                  src={sale.listingID.images[0]}
                  className="sale-listing-image"
                />
              </div>
              <div className="sale-listing-details">
                <p className="sale-listing-name">{sale.listingID.name}</p>
                <p className="sale-price">Amount: S${sale.amount}</p>
                <p className="sale-date">
                  Date: {format(sale.createdAt, "dd MMM yyyy")}
                </p>
              </div>
              {!sale.review && (
                <IonButton className="review-btn">
                  <IonIcon icon={document} />
                </IonButton>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No Sales yet.</p>
      )}
    </div>
  );
}

export default Sales;
